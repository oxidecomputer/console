import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import type { ComponentUpdate } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { componentTypeNames } from '@oxide/api'
import { apiQueryClient, listToTree, useApiQuery } from '@oxide/api'
import { Badge, Hourglass16Icon } from '@oxide/ui'

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

type ComponentNode = ComponentUpdate & { children: ComponentNode[] }

function Tree({ tree }: { tree: ComponentNode[] }) {
  return (
    <ul className="ml-8 list-disc">
      {tree.map((node) => (
        <li key={node.id}>
          {componentTypeNames[node.componentType]} <Badge>{node.version}</Badge>
          <Tree tree={node.children} />
        </li>
      ))}
    </ul>
  )
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

  const dismiss = () => navigate(pb.systemUpdate())

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

  const tree = useMemo(
    () => (components ? listToTree(components.items) : null),
    [components]
  )

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
        startUpdate.mutate({ path: { version } })
      }}
      submitError={startUpdate.error}
    >
      {() => (
        <>
          <h1 className="mb-4 text-sans-xl">Components in this update</h1>
          {tree && <Tree tree={tree} />}
        </>
      )}
    </SideModalForm>
  )
}
