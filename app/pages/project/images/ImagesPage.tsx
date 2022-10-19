import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Images24Icon, PageHeader, PageTitle } from '@oxide/ui'

import { requireProjectParams, useRequiredParams } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Images24Icon />}
    title="No images"
    body="You need to create an image to be able to see it here"
    // buttonText="New image"
    // buttonTo="new"
  />
)

ImagesPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('imageList', {
    path: requireProjectParams(params),
    query: { limit: 10 },
  })
}

export function ImagesPage() {
  const projectParams = useRequiredParams('orgName', 'projectName')
  const { Table, Column } = useQueryTable('imageList', { path: projectParams })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Images</PageTitle>
      </PageHeader>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="size" cell={SizeCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}
