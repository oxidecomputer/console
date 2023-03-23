import { BulkActionMenu } from './BulkActionMenu'

export const Default = () => (
  <BulkActionMenu selectedCount={5} onSelectAll={() => alert('selected all')}>
    <BulkActionMenu.Button>Delete</BulkActionMenu.Button>
    <BulkActionMenu.Button>Edit</BulkActionMenu.Button>
    <BulkActionMenu.Button>More</BulkActionMenu.Button>
  </BulkActionMenu>
)
