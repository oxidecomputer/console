/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { CellContext } from '@tanstack/react-table'

import type { Cell } from './Cell'

export const DefaultCell = ({ value }: Cell<string>) => (
  <span className="text-secondary">{value}</span>
)

export const defaultCell = <T, U extends React.ReactNode>(props: CellContext<T, U>) => (
  <span className="text-secondary">{props.getValue()}</span>
)
