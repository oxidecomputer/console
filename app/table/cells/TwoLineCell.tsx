/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

interface TwoLineCellProps {
  value: [React.ReactNode, React.ReactNode]
  detailsClass?: string
}

export const TwoLineCell = ({ value, detailsClass }: TwoLineCellProps) => (
  <div className="space-y-0.5">
    <div className="text-secondary">{value[0]}</div>
    <div className={cn('text-tertiary', detailsClass)}>{value[1]}</div>
  </div>
)
