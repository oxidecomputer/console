import React from 'react'
import cn from 'classnames'

import type { AriaLabel } from '../../util/aria'
import { ariaLabel } from '../../util/aria'

type Props = {
  value: number // always out of 100
  className?: string
  transitionTime?: number // time in ms
} & AriaLabel

// https://w3c.github.io/aria-practices/#range_related_properties_progressbar_role

export const Progress = (props: Props) => (
  <div
    role="progressbar"
    className={cn('bg-green-900 h-1.5 rounded', props.className)}
    aria-valuenow={Math.round(props.value)}
    {...ariaLabel(props)}
  >
    <div
      className="bg-green-500 h-1.5 rounded"
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
