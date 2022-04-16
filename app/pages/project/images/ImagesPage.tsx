import { useParams } from 'app/hooks'
import { SizeCell, DateCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Image24Icon } from '@oxide/ui'

const EmptyState = () => (
  <EmptyMessage
    icon={<Image24Icon />}
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
      <Column id="name" />
      <Column id="description" />
      <Column id="size" cell={SizeCell} />
      <Column id="created" accessor="timeCreated" cell={DateCell} />
    </Table>
  )
}
