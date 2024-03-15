/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link } from 'react-router-dom'

import { Button, buttonStyle } from './Button'

/**
 * Used _outside_ of the `Table`, this returns either a link or a button that allows the user to take the designated action
 */
type TableActionButtonProps = { label: string } & (
  | { linkTo?: never; onClick?: () => void }
  | { linkTo: string; onClick?: never }
)
export const TableActionButton = ({ label, linkTo, onClick }: TableActionButtonProps) =>
  linkTo ? (
    <Link to={linkTo} className={buttonStyle({ size: 'sm' })}>
      {label}
    </Link>
  ) : (
    <Button onClick={onClick} size="sm" className="shrink-0">
      {label}
    </Button>
  )
