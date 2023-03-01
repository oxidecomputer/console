import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import type { Cell } from './Cell'

export const TableLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link className="text-sans-semi-md text-default hover:underline" to={to}>
    {children}
  </Link>
)

export const linkCell =
  (makeHref: (value: string) => string) =>
  ({ value }: Cell<string>) => {
    return <TableLink to={makeHref(value)}>{value}</TableLink>
  }
