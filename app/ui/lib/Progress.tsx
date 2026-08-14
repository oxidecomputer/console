/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import { ariaLabel, type AriaLabel } from '../util/aria'

export type ProgressProps = {
  value: number // always out of 100
  className?: string
  transitionTime?: number // time in ms
} & AriaLabel

// https://w3c.github.io/aria-practices/#range_related_properties_progressbar_role

export const Progress = (props: ProgressProps) => (
  <div
    // role="progressbar" rather than native <progress>: the native element can't
    // be styled to match (vendor pseudo-elements only) and can't hold the animated
    // inner bar below. role="progressbar" is the equivalent ARIA pattern (see link above).
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    role="progressbar"
    className={cn('bg-accent h-1 rounded-[1px]', props.className)}
    aria-valuenow={Math.round(props.value)}
    {...ariaLabel(props)}
  >
    <div
      className="bg-accent-inverse h-1 rounded-[1px]"
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
