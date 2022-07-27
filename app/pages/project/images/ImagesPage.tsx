import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Images24Icon, PageHeader, PageTitle } from '@oxide/ui'

import { useRequiredParams } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Images24Icon />}
    title="No images"
    body="You need to create an image to be able to see it here"
    // buttonText="New image"
    // buttonTo="new"
  />
)

export const ImagesPage = () => {
  const projectParams = useRequiredParams('orgName', 'projectName')
  const { Table, Column } = useQueryTable('imageList', projectParams)
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
