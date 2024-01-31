/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type IpPoolSiloLink,
} from '@oxide/api'
import {
  DateCell,
  LinkCell,
  SkeletonCell,
  useQueryTable,
  type MenuAction,
} from '@oxide/table'
import {
  Badge,
  EmptyMessage,
  Networking24Icon,
  PageHeader,
  PageTitle,
  Success12Icon,
  Tabs,
} from '@oxide/ui'

import { ExternalLink } from 'app/components/ExternalLink'
import { QueryParamTabs } from 'app/components/QueryParamTabs'
import { getIpPoolSelector, useIpPoolSelector } from 'app/hooks'
import { links } from 'app/util/links'
import { pb } from 'app/util/path-builder'

IpPoolPage.loader = async function ({ params }: LoaderFunctionArgs) {
  const { pool } = getIpPoolSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('ipPoolView', { path: { pool } }),
    apiQueryClient.prefetchQuery('ipPoolSiloList', {
      path: { pool },
      query: { limit: 25 }, // match QueryTable
    }),
    apiQueryClient.prefetchQuery('ipPoolRangeList', {
      path: { pool },
      query: { limit: 25 }, // match QueryTable
    }),
  ])
  return null
}

export function IpPoolPage() {
  const poolSelector = useIpPoolSelector()
  const { data: pool } = usePrefetchedApiQuery('ipPoolView', { path: poolSelector })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{pool.name}</PageTitle>
      </PageHeader>
      <QueryParamTabs className="full-width" defaultValue="ranges">
        <Tabs.List>
          <Tabs.Trigger value="ranges">IP ranges</Tabs.Trigger>
          <Tabs.Trigger value="silos">Linked silos</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="ranges">
          <IpRangesTable />
        </Tabs.Content>
        <Tabs.Content value="silos">
          <LinkedSilosTable />
        </Tabs.Content>
      </QueryParamTabs>
    </>
  )
}

const RangesEmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP ranges"
    body="Add a range to see it here"
    // TODO: link add range button
    // buttonText="Add range"
    // buttonTo={pb.ipPoolNew()}
  />
)

function IpRangesTable() {
  const poolSelector = useIpPoolSelector()
  const { Table, Column } = useQueryTable('ipPoolRangeList', { path: poolSelector })

  return (
    <Table emptyState={<RangesEmptyState />}>
      {/* TODO: only showing the ID is ridiculous. we need names */}
      <Column accessor="range.first" header="First" />
      <Column accessor="range.last" header="Last" />
      <Column accessor="timeCreated" header="Created" cell={DateCell} />
    </Table>
  )
}

const SilosEmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pool associations"
    body="You need to link the IP pool to a silo to be able to see it here"
    // TODO: link silo button
    // buttonText="Link IP pool"
    // buttonTo={pb.ipPoolNew()}
  />
)

function SiloNameFromId({ value: siloId }: { value: string }) {
  const { data: silo } = useApiQuery('siloView', { path: { silo: siloId } })

  if (!silo) return <SkeletonCell />

  return <LinkCell to={pb.siloIpPools({ silo: silo.name })}>{silo.name}</LinkCell>
}

function LinkedSilosTable() {
  const poolSelector = useIpPoolSelector()
  const queryClient = useApiQueryClient()
  const { Table, Column } = useQueryTable('ipPoolSiloList', { path: poolSelector })

  const unlinkSilo = useApiMutation('ipPoolSiloUnlink', {
    onSuccess() {
      queryClient.invalidateQueries('ipPoolSiloList')
    },
  })

  // TODO: confirm action. make clear what linking means
  const makeActions = (link: IpPoolSiloLink): MenuAction[] => [
    {
      label: 'Unlink',
      onActivate() {
        unlinkSilo.mutate({ path: { silo: link.siloId, pool: link.ipPoolId } })
      },
    },
  ]

  return (
    <>
      <p className="mb-8 max-w-2xl text-sans-md text-secondary">
        Users in linked silos can allocate external IPs from this pool for their instances.
        A silo can have at most one default pool. IPs are allocated from the default pool
        when users ask for one without specifying a pool. Read the docs to learn more about{' '}
        <ExternalLink href={links.ipPoolsDocs}>managing IP pools</ExternalLink>.
      </p>
      <Table emptyState={<SilosEmptyState />} makeActions={makeActions}>
        <Column accessor="siloId" id="Silo" cell={SiloNameFromId} />
        <Column
          accessor="isDefault"
          id="Default"
          header="Pool is silo default?"
          cell={({ value }) =>
            value && (
              <>
                <Success12Icon className="mr-1 text-accent" />
                <Badge>default</Badge>
              </>
            )
          }
        />
      </Table>
    </>
  )
}
