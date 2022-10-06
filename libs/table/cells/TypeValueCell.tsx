import { Badge } from '@oxide/ui'

import type { Cell } from './Cell'

export type TypeValue = {
  type: string
  value: string
}

export const TypeValueCell = ({ value: { type, value } }: Cell<TypeValue>) => (
  <div className="space-x-1">
    <Badge variant="secondary">{type}</Badge>
    <Badge>{value}</Badge>
  </div>
)
