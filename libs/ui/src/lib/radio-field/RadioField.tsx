import type { FC } from 'react'
import React from 'react'

import tw, { styled, theme } from 'twin.macro'

import { Icon } from '../icon/Icon'

type Variant = 'base' | 'card'
export type RadioFieldProps = React.ComponentProps<'input'> & {
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
}

const LabelText = styled.span(tw`text-sm text-white`)
const cardLabel = tw`py-2 px-4 bg-green-tint border border-transparent hover:bg-TODO`

// indent = 7, width = 4, wrapper mr = 7 - 4 = 3
const IconWrapper = styled.span(tw`mr-3 -ml-7`)
const EmptyRadio = styled(Icon)(tw`w-4`)
const FilledRadio = styled(Icon)(tw`w-4 text-green`)

const StyledInput = styled.input`
  /* Hide from sighted users, show to screen readers */
  ${tw`sr-only!`}

  &:checked + ${IconWrapper} {
    ${EmptyRadio} {
      display: none;
    }
  }

  &:checked + ${LabelText} {
    ${tw`bg-green-tint border-green hover:bg-TODO`}
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
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
      box-shadow: 0 0 0 1px ${theme`colors.green.400`};
    }
  }

  &:focus + ${LabelText} {
    outline: none;
    box-shadow: 0px 0px 0px 2px ${theme`colors.black`},
      0px 0px 0px 3px ${theme`colors.green.700`};
  }
`

const HintText = tw.span`text-sm mt-1 max-w-prose text-gray-300`

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
    <div tw="flex flex-col flex-shrink-0" css={variant === 'base' && tw`pl-6`}>
      <label tw="items-center inline-flex">
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
        <LabelText css={variant === 'card' && cardLabel}>{children}</LabelText>
      </label>
      {hint && <HintText id={hintId}>{hint}</HintText>}
    </div>
  )
}
