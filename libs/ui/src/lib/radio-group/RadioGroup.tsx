import type { FC, ReactElement, ChangeEventHandler } from 'react'
import React from 'react'

import styled, { css } from 'styled-components'

import type { RadioFieldProps } from '../radio-field/RadioField'
import { Text } from '../text/Text'
import { visuallyHiddenCss } from '../VisuallyHidden'

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

const StyledFieldset = styled.fieldset``

const StyledLegend = styled(Text).attrs({
  as: 'legend',
  color: 'white',
  size: 'lg',
})<{ hideLegend: boolean }>`
  display: block;

  ${({ hideLegend }) => hideLegend && visuallyHiddenCss};
`

const HintText = styled(Text).attrs({ color: 'gray300', size: 'base' })`
  display: block;
  margin-top: ${({ theme }) => theme.spacing(3)};
`

/* Once Safari supports `gap` with flex layouts, this can be replaced with `gap` */
/* gap: ${({ theme }) => theme.spacing(5)}; */
const columnStyles = css`
  flex-direction: column;
  flex-wrap: nowrap;
  margin-top: ${({ theme }) => theme.spacing(5)};

  & > * + * {
    margin-top: ${({ theme }) => theme.spacing(5)};
  }
`
const OFFSET = '3px'
const rowStyles = (shouldOverflow: boolean) => css`
  flex-direction: row;
  ${shouldOverflow
    ? `flex-wrap: nowrap; overflow-x: auto;`
    : `flex-wrap: wrap;`};
  margin-top: ${({ theme }) => theme.spacing(3)};
  padding-top: ${OFFSET};
  padding-left: ${OFFSET};

  & > * {
    margin-right: ${({ theme }) => theme.spacing(5)};
    margin-bottom: ${({ theme }) => theme.spacing(5)};
  }
`

const RadioFieldsWrapper = styled.div<{ direction: Direction }>`
  display: flex;
  justify-content: flex-start;

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
    handleChange && handleChange(event.target.value)
  }
  const hintId = `${name}-hint`
  const ariaProps = hint ? { 'aria-describedby': hintId, tabIndex: 0 } : null
  return (
    <StyledFieldset {...ariaProps}>
      <StyledLegend hideLegend={hideLegend}>{legend}</StyledLegend>
      {hint ? <HintText id={hintId}>{hint}</HintText> : null}
      <RadioFieldsWrapper direction={direction}>
        {React.Children.map(children, (radioField) => {
          const isChecked = checked === radioField.props.value
          // Render cinontrolled inputs with checked state
          // Add name prop to group them semantically and add event listener
          return React.cloneElement(radioField, {
            name: name,
            checked: isChecked,
            onChange: onChange,
            required: required,
          })
        })}
      </RadioFieldsWrapper>
    </StyledFieldset>
  )
}
