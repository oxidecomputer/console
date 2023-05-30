import { Truncate } from '@oxide/ui'

import type { Cell } from './Cell'

export const TruncateCell = ({
  value,
  maxLength = 32,
}: Cell<string> & {
  maxLength?: number
}) => (
  <span className="text-secondary">
    <Truncate text={value} maxLength={maxLength} />
  </span>
)
