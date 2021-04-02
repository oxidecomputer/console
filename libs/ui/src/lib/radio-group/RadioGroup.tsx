import type { FC, ReactEventHandler, ReactElement } from 'react'
import React from 'react'

import styled from 'styled-components'

import type { RadioFieldProps } from '../radio-field/RadioField'
import { Text } from '../text/Text'

export interface RadioGroupProps {
  children: Array<ReactElement<RadioFieldProps>>
  /**
   * The default or initially checked option
   */
  defaultValue?: string
  /**
   * Required description of radio buttons. Helpful for accessibility.
   */
  legend: string
  /**
   * Required name to pass to Radio children
   */
  name: string
  onChange?: ReactEventHandler
  required?: boolean
}

const StyledFieldset = styled.fieldset`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;

  margin: 0;
  border: 0;

  /* Once Safari supports 'gap' with flex layouts, this can be removed */
  /* gap: ${({ theme }) => theme.spacing(5)}; */
  & > * + * {
    margin-right: ${({ theme }) => theme.spacing(5)};
  }
`
const StyledLegend = styled(Text).attrs({
  as: 'legend',
  color: 'white',
  size: 'lg',
})`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`

export const RadioGroup: FC<RadioGroupProps> = ({
  children,
  defaultValue = null,
  legend,
  name,
}) => {
  // Set checked of each child based on state
  const [checked, setChecked] = React.useState(defaultValue)
  const handleChange = React.useCallback(
    (event) => {
      setChecked(event.target.value)
    },
    [setChecked]
  )
  return (
    <StyledFieldset>
      <StyledLegend>{legend}</StyledLegend>
      {React.Children.map(children, (radioField) => {
        const isChecked = checked === radioField.props.value
        // Render controlled inputs with checked state
        // Add name prop to group them semantically and add event listener
        return React.cloneElement(radioField, {
          name: name,
          checked: isChecked,
          onChange: handleChange,
        })
      })}
    </StyledFieldset>
  )
}
