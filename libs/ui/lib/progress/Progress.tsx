import React from 'react'
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
    className={cn('bg-accent-dim h-1.5 rounded', props.className)}
    aria-valuenow={Math.round(props.value)}
    {...ariaLabel(props)}
  >
    <div
      className="bg-accent-solid h-1.5 rounded"
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
