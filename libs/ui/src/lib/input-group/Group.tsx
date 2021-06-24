import React from 'react'
import tw, { css, theme } from 'twin.macro'

import { Icon } from '../icon/Icon'
import { Tooltip } from '../tooltip/Tooltip'

type HintProps = { id: string; children: React.ReactNode }
const Hint = ({ id, children }: HintProps) => (
  <div id={id} tw="flex-1 pb-2 text-gray-300 text-sm font-medium">
    {children}
  </div>
)

type LabelProps = React.ComponentProps<'label'> & { required?: boolean }
const Label = ({ required, children, ...labelProps }: LabelProps) => (
  <label {...labelProps} tw="flex items-baseline justify-between pb-2">
    <span tw="flex items-baseline font-medium">{children}</span>
    {!required && <span tw="text-sm">Optional</span>}
  </label>
)

export const InfoPopover = (props: { children: React.ReactNode }) => (
  <Tooltip isPrimaryLabel={false} content={props.children}>
    <Icon tw="text-gray-300 w-5 margin[0 0.5625rem]" name="infoFilled" />
  </Tooltip>
)

const focusStyle = css`
  &:focus-within {
    ${tw`border-green`}
    box-shadow: 0px 0px 0px 1px ${theme`colors.green.DEFAULT`};
  }
`

const errorStyle = css`
  ${tw`border-red-500`}
  &:focus-within {
    box-shadow: 0px 0px 0px 1px ${theme`colors.red.500`};
  }
`

export interface InputGroupProps {
  id: string
  disabled?: boolean
  required?: boolean
  label: string | React.ReactFragment
  error?: string
  hint?: React.ReactNode
  /**
   * Additional text to show in a popover inside the text field.
   * Should not be requried to understand the use of the field
   */
  info?: React.ReactNode
  children: React.ReactNode
}

export const InputGroup = ({
  id,
  required,
  disabled,
  error,
  hint,
  label,
  info,
  children,
}: InputGroupProps) => {
  const errorId = error ? `${id}-validation-hint` : ''
  const hintId = hint ? `${id}-hint` : ''

  return (
    <div
      tw="flex flex-col text-gray-100 flex-1"
      css={disabled && tw`opacity-40`}
    >
      <Label required={required} htmlFor={id}>
        {label}
      </Label>
      {hint && <Hint id={hintId}>{hint}</Hint>}
      <div
        tw="flex bg-gray-700 border border-transparent"
        css={error ? errorStyle : focusStyle}
      >
        {children}
        {info && <InfoPopover>{info}</InfoPopover>}
      </div>
      {error && (
        <div id={errorId} tw="mt-2 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
