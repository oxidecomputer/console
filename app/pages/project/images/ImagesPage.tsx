import { useParams } from 'app/hooks'
import { SizeCell, DateCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Images24Icon } from '@oxide/ui'

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
  const projectParams = useParams('orgName', 'projectName')
  const { Table, Column } = useQueryTable('projectImagesGet', projectParams)
  return (
    <Table emptyState={<EmptyState />}>
      <Column accessor="name" />
      <Column accessor="description" />
      <Column accessor="size" cell={SizeCell} />
      <Column accessor="timeCreated" header="Created" cell={DateCell} />
    </Table>
  )
}
