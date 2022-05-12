import type { Cell } from './Cell'

import { Badge } from '@oxide/ui'

export const LabelCell = ({ value }: Cell<string>) => <Badge>{value}</Badge>
