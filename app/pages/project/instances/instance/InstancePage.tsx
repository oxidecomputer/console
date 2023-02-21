import filesize from 'filesize'
import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiQuery, useApiQueryClient } from '@oxide/api'
import { Instances24Icon, PageHeader, PageTitle, PropertiesTable } from '@oxide/ui'
import { toPathQuery } from '@oxide/util'

import { MoreActionsMenu } from 'app/components/MoreActionsMenu'
import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { InstanceStatusBadge } from 'app/components/StatusBadge'
import { getInstanceSelector, useInstanceSelector, useQuickActions } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { useMakeInstanceActions } from '../actions'

InstancePage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery(
    'instanceViewV1',
    toPathQuery('instance', getInstanceSelector(params))
  )
  return null
}

export function InstancePage() {
  const instanceSelector = useInstanceSelector()
  const { project, organization } = instanceSelector
  const instancePathQuery = toPathQuery('instance', instanceSelector)

  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  // TODO: change the interface here to take projectSelector directly
  const makeActions = useMakeInstanceActions(
    { project, organization },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('instanceViewV1', instancePathQuery)
      },
      // go to project instances list since there's no more instance
      onDelete: () => navigate(pb.instances(instanceSelector)),
    }
  )

  const { data: instance } = useApiQuery('instanceViewV1', instancePathQuery)
  const actions = useMemo(
    () => (instance ? makeActions(instance) : []),
    [instance, makeActions]
  )
  const quickActions = useMemo(
    () =>
      actions
        // in the quick menu we do not show disabled actions
        .filter((a) => !a.disabled)
        // append "instance" to labels
        // TODO: if these were in an "Instance actions" subsection they might not
        // need the suffix for clarity
        .map((a) => ({ onSelect: a.onActivate, value: `${a.label} instance` })),
    [actions]
  )
  useQuickActions(quickActions)

  if (!instance) return null

  const memory = filesize(instance.memory, { output: 'object', base: 2 })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>{instance.name}</PageTitle>
        <MoreActionsMenu label="Instance actions" actions={actions} />
      </PageHeader>
      <PropertiesTable.Group className="mb-16 -mt-8">
        <PropertiesTable>
          <PropertiesTable.Row label="cpu">
            <span className="text-secondary">{instance.ncpus}</span>
            <span className="ml-1 text-quaternary"> vCPUs</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="ram">
            <span className="text-secondary">{memory.value}</span>
            <span className="ml-1 text-quaternary"> {memory.unit}</span>
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="dns name">
            <span className="text-secondary">{instance.hostname || '–'}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="status">
            <InstanceStatusBadge status={instance.runState} />
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>
      <RouteTabs fullWidth>
        <Tab to={pb.instanceStorage(instanceSelector)}>Storage</Tab>
        <Tab to={pb.instanceMetrics(instanceSelector)}>Metrics</Tab>
        <Tab to={pb.nics(instanceSelector)}>Network Interfaces</Tab>
        <Tab to={pb.serialConsole(instanceSelector)}>Serial Console</Tab>
      </RouteTabs>
    </>
  )
}
