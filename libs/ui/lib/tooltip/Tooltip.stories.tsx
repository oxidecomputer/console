import { Filter12Icon } from '../icons'
import { Tooltip } from './Tooltip'

export const Default = () => (
  <Tooltip id="tooltip" content="Filter" onClick={() => alert('onClick')}>
    <Filter12Icon />
  </Tooltip>
)
