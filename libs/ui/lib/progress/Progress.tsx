/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import type { AriaLabel } from '../../util/aria'
import { ariaLabel } from '../../util/aria'

export type ProgressProps = {
  value: number // always out of 100
  className?: string
  transitionTime?: number // time in ms
} & AriaLabel

// https://w3c.github.io/aria-practices/#range_related_properties_progressbar_role

export const Progress = (props: ProgressProps) => (
  <div
    role="progressbar"
    className={cn('h-1 rounded-[1px] bg-accent-secondary', props.className)}
    aria-valuenow={Math.round(props.value)}
    {...ariaLabel(props)}
  >
    <div
      className="h-1 rounded-[1px] bg-accent"
      style={{
        width: `${props.value}%`,
        transition:
          props.transitionTime !== undefined
            ? `width ${props.transitionTime}ms`
            : undefined,
      }}
    />
  </div>
)
