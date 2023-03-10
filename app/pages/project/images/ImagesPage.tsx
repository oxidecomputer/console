import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Images24Icon, PageHeader, PageTitle } from '@oxide/ui'

import { getProjectSelector, useProjectSelector } from 'app/hooks'

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
  const { project, organization } = getProjectSelector(params)
  await apiQueryClient.prefetchQuery('imageListV1', {
    query: { organization, project, limit: 10 },
  })
  return null
}

export function ImagesPage() {
  const { organization, project } = useProjectSelector()
  const { Table, Column } = useQueryTable('imageListV1', {
    query: { organization, project },
  })
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
