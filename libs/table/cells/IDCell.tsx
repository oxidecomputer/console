import type { Cell } from './Cell'
import { DefaultCell } from './DefaultCell'
import './IdCell.css'

export const IdCell = ({ value }: Cell<string>) => {
  return <DefaultCell value={value} />
}
