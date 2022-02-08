import React from 'react'
import { Link } from 'react-router-dom'
import type { Cell } from './Cell'

export const linkCell =
  (makeHref: (value: string) => string) =>
  ({ value }: Cell<string>) => {
    return (
      <Link className="text-accent" to={makeHref(value)}>
        {value}
      </Link>
    )
  }
