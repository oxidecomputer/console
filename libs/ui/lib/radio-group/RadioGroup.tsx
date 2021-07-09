import type { FC, ReactElement, ChangeEventHandler } from 'react'
import React from 'react'
import cn from 'classnames'

import './RadioGroup.css'

import type { RadioFieldProps } from '../radio-field/RadioField'
import { classed } from '../../util/classed'

type Direction = 'fixed-row' | 'row' | 'column'
export interface RadioGroupProps {
  /**
   * The currently selected or checked Radio button
   */
  checked: string
  children: Array<ReactElement<RadioFieldProps>>
  /**
   * Set direction or layout of radio buttons. Defaults to column.
   */
  direction?: Direction
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
  direction = 'column',
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
      <div className={`RadioGroup-${direction}`}>
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
