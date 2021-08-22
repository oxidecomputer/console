import type { FC, ChangeEventHandler } from 'react'
import React from 'react'
import cn from 'classnames'

import { classed } from '../../util/classed'

export interface RadioGroupProps {
  /**
   * The currently selected or checked Radio button
   */
  value: string
  children: React.ReactElement[]
  handleChange: (value: string) => void
  /**
   * Hide legend from sighted users.
   */
  hideLegend?: boolean
  hint?: string
  /**
   * Required. Description of radio buttons. Helpful for accessibility.
   */
  legend: string
  /**
   * Required.
   */
  name: string
  /**
   * Set whether radio group is optional or not.
   */
  required?: boolean
  column?: boolean
}

const HintText = classed.div`text-base text-gray-100 font-sans font-light mt-3 max-w-3xl`

export const RadioGroup: FC<RadioGroupProps> = ({
  value,
  children,
  handleChange,
  hint,
  hideLegend = false,
  legend,
  name,
  required = false,
  column = false,
}) => {
  // Set checked of each child based on state
  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation()
    handleChange?.(event.target.value)
  }
  const hintId = `${name}-hint`
  const ariaProps = hint ? { 'aria-describedby': hintId, tabIndex: 0 } : null
  return (
    <fieldset {...ariaProps}>
      <legend className={cn('text-white text-lg', hideLegend && 'sr-only')}>
        {legend}
      </legend>
      {hint && <HintText id={hintId}>{hint}</HintText>}
      <div
        className={cn(
          'flex justify-start mt-3 pt-[3px] pl-[3px]',
          column ? 'flex-col space-y-2' : 'flex-wrap gap-5'
        )}
      >
        {React.Children.map(children, (radioField) =>
          React.cloneElement(radioField, {
            name: name,
            checked: radioField.props.value === value,
            onChange: onChange,
            required: required,
          })
        )}
      </div>
    </fieldset>
  )
}
