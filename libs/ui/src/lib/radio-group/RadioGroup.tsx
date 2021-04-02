import type { FC, ReactEventHandler, ReactElement } from 'react'
import React from 'react'

import styled, { css } from 'styled-components'

import type { RadioFieldProps } from '../radio-field/RadioField'
import { Text } from '../text/Text'

type DirectionType = 'fixed-row' | 'row' | 'column'
export interface RadioGroupProps {
  children: Array<ReactElement<RadioFieldProps>>
  /**
   * The default or initially checked option
   */
  defaultValue?: string
  /**
   * Set direction or layout of radio buttons. Defaults to column.
   */
  direction?: DirectionType
  /**
   * Required. Description of radio buttons. Helpful for accessibility.
   */
  legend: string
  /**
   * Required.
   */
  name: string
  onChange?: ReactEventHandler
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

const StyledFieldset = styled.fieldset<{ direction: DirectionType }>`
  display: flex;
  justify-content: flex-start;

  margin: 0;
  border: 0;

  ${({ direction }) => {
    if (direction === 'column') {
      return columnStyles
    }
    if (direction === 'row') {
      console.log('wrap')
      return rowStyles(false)
    }
    if (direction === 'fixed-row') {
      console.log('no-wrap')
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
  defaultValue = null,
  direction = 'column',
  legend,
  onChange,
  name,
  required = false,
}) => {
  // Set checked of each child based on state
  const [checked, setChecked] = React.useState(defaultValue)
  const handleChange = React.useCallback(
    (event) => {
      setChecked(event.target.value)
      onChange && onChange(event)
    },
    [setChecked, onChange]
  )
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
          onChange: handleChange,
          required: required,
        })
      })}
    </StyledFieldset>
  )
}
