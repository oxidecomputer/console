import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import type { ComponentUpdate } from '@oxide/api'
import { apiQueryClient, listToTree, useApiQuery } from '@oxide/api'
import { Badge, PageHeader, PageTitle, SoftwareUpdate24Icon } from '@oxide/ui'

import { requireUpdateParams, useUpdateParams } from 'app/hooks'

UpdateDetailPage.loader = async ({ params }: LoaderFunctionArgs) => {
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
          {node.deviceType} <Badge>{node.version}</Badge>
          <Tree tree={node.children} />
        </li>
      ))}
    </ul>
  )
}

export function UpdateDetailPage() {
  const { data: update } = useApiQuery('systemUpdateView', {
    path: useUpdateParams(),
  })
  const { data: components } = useApiQuery('systemUpdateComponentsList', {
    path: useUpdateParams(),
  })

  const tree = useMemo(
    () => (components ? listToTree(components.items) : null),
    [components]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<SoftwareUpdate24Icon />}>System Update</PageTitle>
      </PageHeader>
      <p>Version: {update?.version}</p>
      <h1 className="mb-4 mt-8 text-sans-2xl">Components in this update</h1>
      {tree && <Tree tree={tree} />}
    </>
  )
}
