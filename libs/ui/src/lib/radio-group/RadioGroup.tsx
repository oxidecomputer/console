import type { FC, ReactElement, ChangeEventHandler } from 'react'
import React from 'react'

import tw, { css, styled } from 'twin.macro'

import type { RadioFieldProps } from '../radio-field/RadioField'

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

const HintText = tw.div`text-base text-gray-300 mt-3 max-w-3xl`

const OFFSET = '3px'
const rowStyles = css`
  ${tw`mt-3`}
  padding-top: ${OFFSET};
  padding-left: ${OFFSET};

  & > * {
    ${tw`mr-5 mb-5`}
  }
`

const RadioFieldsWrapper = styled.div<{ direction: Direction }>`
  display: flex;
  justify-content: flex-start;

  ${({ direction }) => {
    if (direction === 'column') {
      /* Once Safari supports `gap` with flex layouts, this can be replaced with `gap` */
      return tw`flex-col mt-5 space-y-5`
    }
    if (direction === 'row') {
      return [rowStyles, tw`flex-wrap`]
    }
    if (direction === 'fixed-row') {
      return [rowStyles, tw`overflow-x-auto`]
    }
  }}
`

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
      <legend tw="text-white text-lg" css={hideLegend && tw`sr-only`}>
        {legend}
      </legend>
      {hint ? <HintText id={hintId}>{hint}</HintText> : null}
      <RadioFieldsWrapper direction={direction}>
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
      </RadioFieldsWrapper>
    </fieldset>
  )
}
