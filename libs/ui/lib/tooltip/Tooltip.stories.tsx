import { Truncate } from '../../util/truncate'
import { Filter12Icon } from '../icons'
import { Tooltip } from './Tooltip'

export const Default = () => (
  <>
    <Tooltip content="Filter">
      <button>
        <Filter12Icon />
      </button>
    </Tooltip>
    <div>
      <Truncate text="document.getElementById(foo).innerHTML" maxLength={30} />
    </div>
    <div>
      <Truncate
        text="document.getElementById(foo).innerHTML"
        maxLength={30}
        position="middle"
      />
    </div>
    <div className="text-secondary">
      <Truncate
        text="document.getElementById(foo).innerHTML"
        maxLength={30}
        position="middle"
        hasCopyButton
      />
    </div>
    <div>
      <Truncate text="document.getElementById(foo).innerHTML" maxLength={100} />
    </div>
  </>
)
