import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, componentTypeNames, useApiMutation, useApiQuery } from '@oxide/api'
import { Badge, Hourglass16Icon, PropertiesTable, Tabs } from '@oxide/ui'
import { formatDateTime } from '@oxide/util'

import { SideModalForm } from 'app/components/form'
import { requireUpdateParams, useToast, useUpdateParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

UpdateDetailSideModal.loader = async ({ params }: LoaderFunctionArgs) => {
  const path = requireUpdateParams(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('systemUpdateView', { path }),
    apiQueryClient.prefetchQuery('systemUpdateComponentsList', { path }),
  ])
  return null
}

export function UpdateDetailSideModal() {
  const navigate = useNavigate()
  const addToast = useToast()
  const { data: update } = useApiQuery('systemUpdateView', {
    path: useUpdateParams(),
  })
  const { data: components } = useApiQuery('systemUpdateComponentsList', {
    path: useUpdateParams(),
  })

  const dismiss = () => navigate(pb.systemUpdates())

  const startUpdate = useApiMutation('systemUpdateStart', {
    onSuccess() {
      addToast({
        icon: <Hourglass16Icon />,
        title: 'Update starting...',
      })
      // TODO: if we have an update attempt detail view, we should probably land there.
      // otherwise update dashboard with status info is fine
      dismiss()
    },
  })

  return (
    <SideModalForm
      id="system-update-detail"
      formOptions={{}}
      title="Prepare update"
      onDismiss={dismiss}
      submitLabel="Start update"
      onSubmit={() => {
        const version = update?.version
        if (!version) return
        startUpdate.mutate({ body: { version } })
      }}
      submitError={startUpdate.error}
    >
      {() => (
        <>
          <PropertiesTable>
            <PropertiesTable.Row label="version">{update?.version}</PropertiesTable.Row>
            <PropertiesTable.Row label="created">
              {update?.timeCreated && formatDateTime(update.timeCreated)}
            </PropertiesTable.Row>
          </PropertiesTable>
          {/* TODO: 40px offset for full width tabs for main page doesn't work here, should be 32px */}
          <Tabs.Root defaultValue="updates" className="full-width">
            <Tabs.List>
              <Tabs.Trigger value="updates">Contained updates</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="updates">
              <ul className="ml-8 list-disc">
                {(components?.items || []).map((node) => (
                  <li key={node.id}>
                    {componentTypeNames[node.componentType]} <Badge>{node.version}</Badge>
                  </li>
                ))}
              </ul>
            </Tabs.Content>
          </Tabs.Root>
        </>
      )}
    </SideModalForm>
  )
}
