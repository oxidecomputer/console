import React from 'react'
import cn from 'classnames'

import { Icon } from '../icon/Icon'
import { Tooltip } from '../tooltip/Tooltip'
import { classed } from '../../util/classed'

const Hint = classed.div`flex-1 pb-2 text-gray-50 text-sm font-sans font-light`

type LabelProps = React.ComponentProps<'label'> & { required?: boolean }
const Label = ({ required, children, ...labelProps }: LabelProps) => (
  <label
    {...labelProps}
    className="flex items-baseline font-sans font-light justify-between pb-2"
  >
    <span className="flex items-baseline text-lg">{children}</span>
    {!required && <span className="text-sm">Optional</span>}
  </label>
)

export const InfoPopover = (props: { children: React.ReactNode }) => (
  <Tooltip isPrimaryLabel={false} content={props.children}>
    <Icon className="text-gray-50 w-5 my-0 mx-[0.5625rem]" name="infoFilled" />
  </Tooltip>
)

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
    <div className="flex flex-col text-gray-50 flex-1">
      <Label required={required} htmlFor={id}>
        {label}
      </Label>
      {hint && <Hint id={hintId}>{hint}</Hint>}
      <div
        className={cn(
          'flex border border-gray-400 rounded-px',
          'focus-within:border-green-500 hover:focus-within:border-green-500',
          error && '!border-red-500',
          !disabled && 'hover:border-gray-300'
        )}
      >
        {children}
        {info && <InfoPopover>{info}</InfoPopover>}
      </div>
      {error && (
        <div id={errorId} className="mt-2 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
