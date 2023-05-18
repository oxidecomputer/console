import { Truncate } from '@oxide/ui'

import type { Cell } from './Cell'

export const TruncateCell = ({ value }: Cell<string>) => (
  <span className="text-secondary">
    <Truncate text={value} maxLength={32} />
  </span>
)
