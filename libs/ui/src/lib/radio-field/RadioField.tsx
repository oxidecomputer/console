import type { FC } from 'react'
import React from 'react'

import styled, { css } from 'styled-components'
import type { DefaultTheme, StyledComponentProps } from 'styled-components'

import { Text } from '../text/Text'
import { Icon } from '../icon/Icon'
import { spacing, visuallyHidden, color } from '@oxide/css-helpers'

type Variant = 'base' | 'card'
export type RadioFieldProps = StyledComponentProps<
  'input',
  DefaultTheme,
  {
    /**
     * RadioGroup will handle checked based on its value
     */
    checked?: boolean
    onChange?: React.ChangeEventHandler
    /**
     * Additional text to associate with this specific field
     */
    hint?: string | React.ReactNode
    /**
     * RadioGroup will pass `name` to Radio fields.
     */
    name?: string
    required?: boolean
    /**
     * The value is a useful way to handle controlled radio inputs
     */
    value: string
    variant?: Variant
  },
  never
>

const INDENT = 6
const RADIO_WIDTH = 3.5

const Wrapper = styled.div<{ variant: Variant }>`
  flex-shrink: 0;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;

  ${({ variant }) => {
    if (variant === 'base') {
      return css`
        padding-left: ${spacing(INDENT)};
      `
    }
  }}
`

const Label = styled.label`
  align-items: center;
  display: inline-flex;
`

const LabelText = styled(Text).attrs({ size: 'sm' })<{ radioVariant: Variant }>`
  color: ${color('white')};

  ${({ radioVariant }) => {
    if (radioVariant === 'card') {
      return css`
        padding: ${spacing(2)} ${spacing(4)};
        background-color: ${color('darkGreen800')};
        border: 1px solid transparent;

        &:hover {
          background-color: ${color('darkGreen900')};
        }
      `
    }
  }}
`

const IconWrapper = styled.span`
  margin-right: ${spacing(INDENT - RADIO_WIDTH)};
  margin-left: ${spacing(-1 * INDENT)};
`

const EmptyRadio = styled(Icon)`
  width: ${spacing(RADIO_WIDTH)};
`

const FilledRadio = styled(Icon)`
  width: ${spacing(RADIO_WIDTH)};

  color: ${color('green500')};
`

const StyledInput = styled.input`
  /* Hide from sighted users, show to screen readers */
  ${visuallyHidden}

  &:checked + ${IconWrapper} {
    ${EmptyRadio} {
      display: none;
    }
  }

  &:checked + ${LabelText} {
    background-color: ${color('darkGreen800')};
    border-color: ${color('green500')};
    box-shadow: 0px 1px 2px ${color('black', 0.05)};

    &:hover {
      background-color: ${color('darkGreen900')};
    }
  }

  &:not(:checked) + ${IconWrapper} {
    ${FilledRadio} {
      display: none;
    }
  }

  &:focus + ${IconWrapper} {
    ${EmptyRadio}, ${FilledRadio} {
      outline: none;
      border-radius: 50%;
      box-shadow: 0 0 0 1px ${color('green400')};
    }
  }

  &:focus + ${LabelText} {
    outline: none;
    box-shadow: 0px 0px 0px 2px ${color('gray900')},
      0px 0px 0px 3px ${color('green700')};
  }
`

const HintText = styled(Text).attrs({ size: 'sm' })`
  margin-top: ${spacing(1)};
  max-width: ${spacing(100)};

  color: ${color('gray300')};
`

export const RadioField: FC<RadioFieldProps> = ({
  checked,
  children,
  hint,
  name,
  onChange,
  required = false,
  value,
  variant = 'base',
}) => {
  const hintId = hint ? `${value}-hint` : ``
  const ariaProps = hint ? { 'aria-describedby': hintId } : {}

  const renderIcons =
    variant === 'base' ? (
      <IconWrapper>
        <EmptyRadio name="radioE" />
        <FilledRadio name="radioF" />
      </IconWrapper>
    ) : null

  return (
    <Wrapper variant={variant}>
      <Label>
        <StyledInput
          checked={checked}
          name={name}
          onChange={onChange}
          required={required}
          type="radio"
          value={value}
          {...ariaProps}
        />
        {renderIcons}
        <LabelText radioVariant={variant}>{children}</LabelText>
      </Label>
      {hint && <HintText id={hintId}>{hint}</HintText>}
    </Wrapper>
  )
}
