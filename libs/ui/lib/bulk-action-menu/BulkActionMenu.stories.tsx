import { Delete10Icon, Edit16Icon, Terminal10Icon } from '../icons'
import { BulkActionMenu } from './BulkActionMenu'

export const Default = () => (
  <BulkActionMenu selectedCount={5} onSelectAll={() => alert('selected all')}>
    <BulkActionMenu.Button>
      <Delete10Icon /> delete
    </BulkActionMenu.Button>
    <BulkActionMenu.Button>
      <Edit16Icon /> edit
    </BulkActionMenu.Button>
    <BulkActionMenu.Button>
      <Terminal10Icon /> more
    </BulkActionMenu.Button>
  </BulkActionMenu>
)
