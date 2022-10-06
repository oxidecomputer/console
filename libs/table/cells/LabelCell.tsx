import { Badge } from '@oxide/ui'

import type { Cell } from './Cell'

export const LabelCell = ({ value }: Cell<string>) => <Badge>{value}</Badge>
