import fileSize from 'filesize'

import type { Cell } from './Cell'

/** Human-readable format for size in bytes */
export const SizeCell = ({ value: bytes }: Cell<number>) => {
  const size = fileSize(bytes, { base: 2, output: 'object' })
  return (
    <span className="text-default">
      {size.value} <span className="text-secondary">{size.unit}</span>
    </span>
  )
}
