import type { FC, ReactElement, ChangeEventHandler } from 'react'
import React from 'react'

import styled, { css } from 'styled-components'

import type { RadioFieldProps } from '../radio-field/RadioField'
import { Text } from '../text/Text'

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
  /**
   * Required. Description of radio buttons. Helpful for accessibility.
   */
  legend: string
  /**
   * Required.
   */
  name: string
  handleChange: (value: string) => void
  /**
   * Set whether radio group is optional or not.
   */
  required?: boolean
}

/* Once Safari supports `gap` with flex layouts, this can be replaced with `gap` */
/* gap: ${({ theme }) => theme.spacing(5)}; */
const columnStyles = css`
  flex-direction: column;
  flex-wrap: nowrap;

  & > * + * {
    margin-top: ${({ theme }) => theme.spacing(5)};
  }
`

const rowStyles = (shouldOverflow: boolean) => css`
  flex-direction: row;
  ${shouldOverflow
    ? `flex-wrap: nowrap; overflow-x: auto;`
    : `flex-wrap: wrap;`};

  & > * + * {
    margin-top: ${({ theme }) => theme.spacing(3)};
    margin-right: ${({ theme }) => theme.spacing(5)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`

const StyledFieldset = styled.fieldset<{ direction: Direction }>`
  display: flex;
  justify-content: flex-start;

  margin: 0;
  border: 0;

  ${({ direction }) => {
    if (direction === 'column') {
      return columnStyles
    }
    if (direction === 'row') {
      return rowStyles(false)
    }
    if (direction === 'fixed-row') {
      return rowStyles(true)
    }
  }}
`
const StyledLegend = styled(Text).attrs({
  as: 'legend',
  color: 'white',
  size: 'lg',
})`
  display: block;
  width: 100%;
`

export const RadioGroup: FC<RadioGroupProps> = ({
  children,
  checked,
  direction = 'column',
  legend,
  handleChange,
  name,
  required = false,
}) => {
  // Set checked of each child based on state
  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    handleChange && handleChange(event.target.value)
  }
  return (
    <StyledFieldset direction={direction}>
      <StyledLegend>{legend}</StyledLegend>
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
    </StyledFieldset>
  )
}
