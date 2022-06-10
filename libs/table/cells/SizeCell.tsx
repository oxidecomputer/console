import fileSize from 'filesize'

import type { Cell } from './Cell'

/** Human-readable format for size in bytes */
export const SizeCell = ({ value: bytes }: Cell<number>) => (
  <span className="text-default">{fileSize(bytes, { base: 2 })}</span>
)
