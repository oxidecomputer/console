import type { FC, ChangeEventHandler } from 'react'
import React from 'react'
import cn from 'classnames'

import { classed } from '../../util/classed'

export interface RadioGroupProps {
  /**
   * The currently selected or checked Radio button
   */
  checked: string
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
}

const HintText = classed.div`text-base text-gray-100 font-sans font-light mt-3 max-w-3xl`

export const RadioGroup: FC<RadioGroupProps> = ({
  checked,
  children,
  handleChange,
  hint,
  hideLegend = false,
  legend,
  name,
  required = false,
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
      <div className="flex flex-wrap gap-5 justify-start mt-3 pt-[3px] pl-[3px]">
        {React.Children.map(children, (radioField) => {
          const isChecked = checked === radioField.props.value
          // Render controlled inputs with checked state
          // Add name prop to group them semantically and add event listener
          return React.cloneElement(radioField, {
            name: name,
            checked: isChecked,
            onChange: onChange,
            required: required,
          })
        })}
      </div>
    </fieldset>
  )
}
