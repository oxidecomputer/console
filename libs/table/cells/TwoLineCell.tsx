import cn from 'classnames'

import type { Cell } from './Cell'

interface TwoLineCellProps extends Cell<[string | JSX.Element, string | JSX.Element]> {
  detailsClass?: string
}

export const TwoLineCell = ({ value, detailsClass }: TwoLineCellProps) => (
  <div className="space-y-0.5">
    <div className="text-secondary">{value[0]}</div>
    <div className={cn('text-tertiary', detailsClass)}>{value[1]}</div>
  </div>
)
