/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet } from 'react-router'

import {
  api,
  getListQFn,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type Certificate,
} from '@oxide/api'
import { Key24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { parseCertificate } from '~/components/form/fields/TlsCertsField'
import { HL } from '~/components/HL'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

import type { Route } from './+types/SiloCertificatesTab'

const siloCertsQuery = (silo: string) =>
  getListQFn(api.siloCertificateList, { query: { silo } })

// a silo has a handful of certs at most, so fetch all of them to know the
// count and names regardless of the table's current page
const allSiloCertsQuery = (silo: string) =>
  getListQFn(api.siloCertificateList, { query: { silo, limit: ALL_ISH } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { silo } = params
  await Promise.all([
    queryClient.prefetchQuery(siloCertsQuery(silo).optionsFn()),
    queryClient.prefetchQuery(allSiloCertsQuery(silo).optionsFn()),
  ])
  return null
}

export const handle = makeCrumb('Certificates', (params) =>
  pb.siloCertificates(getSiloSelector(params))
)

// The API only returns the PEM, so pull domains and expiry out client-side
function ExpiresCell({ cert }: { cert: string }) {
  const { notAfter, isValid } = parseCertificate(cert)
  if (!isValid || !notAfter) return <Badge color="neutral">Unknown</Badge>
  return (
    <div className="flex items-center gap-2">
      <DateTime date={notAfter} />
      {notAfter < new Date() && <Badge color="destructive">Expired</Badge>}
    </div>
  )
}

function DomainsCell({ cert }: { cert: string }) {
  const { subjectAltNames, commonNames } = parseCertificate(cert)
  const domains = subjectAltNames.length > 0 ? subjectAltNames : commonNames
  if (domains.length === 0) return <span className="text-tertiary">—</span>
  return (
    <ul>
      {domains.map((d) => (
        <li key={d}>{d}</li>
      ))}
    </ul>
  )
}

const colHelper = createColumnHelper<Certificate>()
const makeStaticCols = (silo: string) => [
  colHelper.accessor('name', {
    cell: makeLinkCell((certificate) => pb.siloCertificate({ silo, certificate })),
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('cert', {
    id: 'domains',
    header: 'Domains',
    cell: (info) => <DomainsCell cert={info.getValue()} />,
  }),
  colHelper.accessor('cert', {
    id: 'expires',
    header: 'Expires',
    cell: (info) => <ExpiresCell cert={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export default function SiloCertificatesTab() {
  const { silo } = useSiloSelector()
  const { data: allCerts } = usePrefetchedQuery(allSiloCertsQuery(silo).optionsFn())
  const isLastCert = allCerts.items.length === 1

  const { mutateAsync: deleteCert } = useApiMutation(api.siloCertificateDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('siloCertificateList')
      addToast(
        <>
          Certificate <HL>{variables.path.certificate}</HL> deleted
        </>
      )
    },
  })

  const makeActions = useCallback(
    (cert: Certificate): MenuAction[] => [
      {
        label: 'Delete',
        onActivate: confirmDelete({
          // silo must be omitted when the cert is specified by ID
          doDelete: () => deleteCert({ path: { certificate: cert.id } }),
          label: cert.name,
          resourceKind: 'certificate',
          // Nexus allows deleting a silo's last cert, which breaks TLS for the
          // silo. Drop this warning once the API prevents it.
          // https://github.com/oxidecomputer/omicron/issues/11272
          // TODO: like the user and group delete discussed in the users and
          // groups PR, deleting the last cert probably wants a typed
          // confirmation (enter the cert or silo name) rather than a plain
          // confirm button.
          extraContent: isLastCert ? (
            <Message
              variant="notice"
              title="Last certificate"
              content="This is the only certificate for this silo. Without it, the silo will not be reachable over HTTPS."
            />
          ) : undefined,
        }),
      },
    ],
    [deleteCert, isLastCert]
  )

  const staticCols = useMemo(() => makeStaticCols(silo), [silo])
  const columns = useColsWithActions(staticCols, makeActions)
  const { table } = useQueryTable({
    query: siloCertsQuery(silo),
    columns,
    emptyState: (
      <EmptyMessage
        icon={<Key24Icon />}
        title="No certificates"
        body="Add a TLS certificate to see it here"
        buttonText="Add certificate"
        buttonTo={pb.siloCertificatesNew({ silo })}
      />
    ),
  })

  return (
    <>
      <div className="mb-3 flex justify-end">
        <CreateLink to={pb.siloCertificatesNew({ silo })}>Add certificate</CreateLink>
      </div>
      {table}
      <Outlet />
    </>
  )
}
