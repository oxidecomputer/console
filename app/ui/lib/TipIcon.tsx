/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import { Question12Icon } from '@oxide/design-system/icons/react'

import { Tooltip } from './Tooltip'

type TipIconProps = {
  children: React.ReactNode
  className?: string
}
export function TipIcon({ children, className }: TipIconProps) {
  return (
    <Tooltip content={children} placement="top">
      <button
        className={cn('inline-flex svg:pointer-events-none', className)}
        type="button"
      >
        <Question12Icon className="text-quinary" />
      </button>
    </Tooltip>
  )
}
