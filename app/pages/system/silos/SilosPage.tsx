/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router'

import { api, getListQFn, queryClient, useApiMutation, type Silo } from '@oxide/api'
import { Cloud16Icon, Cloud24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { BooleanCell } from '~/table/cells/BooleanCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const siloList = () => getListQFn(api.siloList, {})

const EmptyState = () => (
  <EmptyMessage
    icon={<Cloud24Icon />}
    title="No silos"
    body="Create a silo to see it here"
    buttonText="New silo"
    buttonTo={pb.silosNew()}
  />
)

const colHelper = createColumnHelper<Silo>()
const staticCols = [
  colHelper.accessor('name', {
    cell: (info) => makeLinkCell((name) => pb.silo({ silo: name }))(info),
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('discoverable', {
    cell: (info) => <BooleanCell isTrue={info.getValue()} />,
  }),
  colHelper.accessor((silo) => silo.identityMode, {
    header: 'Identity mode',
    cell: (info) => <Badge>{info.getValue().replace('_', ' ')}</Badge>,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export async function clientLoader() {
  await queryClient.prefetchQuery(siloList().optionsFn())
  return null
}

export const handle = makeCrumb('Silos', pb.silos())

export default function SilosPage() {
  const navigate = useNavigate()

  const { mutateAsync: deleteSilo } = useApiMutation(api.siloDelete, {
    onSuccess(_silo, { path }) {
      queryClient.invalidateEndpoint('siloList')
      // prettier-ignore
      addToast(<>Silo <HL>{path.silo}</HL> deleted</>)
    },
  })

  const makeActions = useCallback(
    (silo: Silo): MenuAction[] => [
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteSilo({ path: { silo: silo.name } }),
          label: silo.name,
        }),
      },
    ],
    [deleteSilo]
  )

  const columns = useColsWithActions(staticCols, makeActions)
  const { table, query } = useQueryTable({
    query: siloList(),
    columns,
    emptyState: <EmptyState />,
  })
  const { data: silos } = query

  useQuickActions(
    useMemo(
      () => [
        { value: 'New silo', onSelect: () => navigate(pb.silosNew()) },
        ...(silos?.items || []).map((o) => ({
          value: o.name,
          onSelect: () => navigate(pb.silo({ silo: o.name })),
          navGroup: 'Silo detail',
        })),
      ],
      [navigate, silos]
    )
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Cloud24Icon />}>Silos</PageTitle>
        <DocsPopover
          heading="silos"
          icon={<Cloud16Icon />}
          summary="Silos provide strict tenancy separation between groups of users. Each silo has its own resource limits and access policies as well as its own subdomain for the web console and API."
          links={[docLinks.systemSilo]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.silosNew()}>New silo</CreateLink>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
