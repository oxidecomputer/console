/**
 * Give a list of radios the same `name` and set `checked` props of the
 * individual radios based on the group-level value. A radio is checked if its
 * value matches the group-level value.
 *
 * Usage:
 *
 *   <fieldset>
 *     <legend>Pick a foot</legend>
 *     <RadioGroup column>
 *       <Radio value="left">Left</radio>
 *       <Radio value="right">Right</radio>
 *     </RadioGroup>
 *   </fieldset>
 *
 * With hint:
 *
 *   <fieldset aria-describedby="foot-hint">
 *     <legend>Pick a foot</legend>
 *     <p id="foot-hint">Don't think about it too hard</p>
 *     <RadioGroup column>
 *       <Radio value="left">Left</radio>
 *       <Radio value="right">Right</radio>
 *     </RadioGroup>
 *   </fieldset>
 *
 * - MUST be inside a <fieldset>
 *
 * - You MUST have a <legend> inside the <fieldset>. If for some reason you
 *   don't want the legend visible, use TW's `sr-only` to hide it for sighted
 *   users. You would think you could point it at any heading with
 *   aria-labelledby, but accessibility tools show warnings when you do that.
 *   fieldsets are supposed to have a legend.
 *   https://w3c.github.io/aria-practices/#naming_with_legends
 *
 * - A hint can go anywhere, just put an `id` on it and point the fieldset at it
 *   with aria-describedby. Adding tabIndex="0" to the fieldset if there's a
 *   hint is perhaps worth considering because it makes the fieldset focusable,
 *   which is the only way a screenreader is going to read the hint (I think),
 *   but in general putting a tabIndex on non-interactive elements is considered
 *   more confusing than helpful.
 *   https://www.a11yproject.com/posts/2021-01-28-how-to-use-the-tabindex-attribute/#making-non-interactive-elements-focusable
 */

import type { ChangeEvent } from 'react'
import React from 'react'
import cn from 'classnames'

import { classed } from '../../util/classed'

export const RadioGroupHint = classed.p`text-base text-gray-100 font-sans font-light max-w-3xl`

type Props = {
  // gets passed to all the radios. this is what defines them as a group
  name: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  children: React.ReactElement[]
  // gets passed to all the radios (technically only needs to be on one)
  required?: boolean
  // For vertical layout of regular Radios. Leave it off for RadioCards.
  column?: boolean
  className?: string
}

export const RadioGroup = (props: Props) => (
  <div
    className={cn(
      'flex',
      props.column ? 'flex-col space-y-2' : 'flex-wrap gap-5',
      props.className
    )}
  >
    {React.Children.map(props.children, (radio) =>
      React.cloneElement(radio, {
        name: props.name,
        checked: radio.props.value === props.value,
        onChange: props.onChange,
        required: props.required,
      })
    )}
  </div>
)
