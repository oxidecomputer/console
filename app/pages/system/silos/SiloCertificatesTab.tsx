/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useState } from 'react'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type Certificate,
} from '@oxide/api'
import { Key24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { AddCertModal, parseCertificate } from '~/components/form/fields/TlsCertsField'
import { HL } from '~/components/HL'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useSiloSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateButton } from '~/ui/lib/CreateButton'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { ALL_ISH } from '~/util/consts'

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

export const handle = makeCrumb('Certificates')

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
const staticCols = [
  colHelper.accessor('name', {}),
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
  const siloSelector = useSiloSelector()
  const { silo } = siloSelector
  // prefetched by the parent SiloPage loader
  const { data: siloData } = usePrefetchedQuery(q(api.siloView, { path: siloSelector }))
  const [showCreate, setShowCreate] = useState(false)
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

  const createCert = useApiMutation(api.siloCertificateCreate, {
    onSuccess(cert) {
      queryClient.invalidateEndpoint('siloCertificateList')
      addToast(
        <>
          Certificate <HL>{cert.name}</HL> added
        </>
      )
      setShowCreate(false)
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
          extraContent: isLastCert
            ? 'This is the only certificate for this silo. Without it, the silo will not be reachable over HTTPS.'
            : undefined,
        }),
      },
    ],
    [deleteCert, isLastCert]
  )

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
        onClick={() => setShowCreate(true)}
      />
    ),
  })

  const allNames = allCerts.items.map((c) => c.name)

  return (
    <>
      <div className="mb-3 flex justify-end">
        <CreateButton onClick={() => setShowCreate(true)}>Add certificate</CreateButton>
      </div>
      {table}
      {showCreate && (
        <AddCertModal
          onDismiss={() => {
            createCert.reset()
            setShowCreate(false)
          }}
          onSubmit={async ({ cert, key, ...rest }) => {
            // required fields, always present if form validation passed
            if (!cert || !key) return
            createCert.mutate({
              query: { silo },
              body: { ...rest, cert: await cert.text(), key: await key.text() },
            })
          }}
          allNames={allNames}
          siloName={siloData.name}
          loading={createCert.isPending}
          submitError={createCert.error}
        />
      )}
    </>
  )
}
