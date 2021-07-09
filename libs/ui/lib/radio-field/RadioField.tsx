import type { FC } from 'react'
import React from 'react'
import cn from 'classnames'

import { classed } from '../../util/classed'
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
  hint?: React.ReactNode
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

const cardLabel = `
  py-2 px-4 bg-gray-500 border rounded-px border-gray-400 hover:text-green-500 
  peer-focus:ring-2 peer-focus:ring-green-700
  peer-checked:bg-green-900 peer-checked:border-green-500 peer-checked:text-green-500
`

const HintText = classed.span`text-sm mt-1 max-w-prose text-gray-50`

// TODO: correct focus styling
const radioIcons = (
  <>
    <Icon
      name="radioE"
      className="w-5 mr-2 -ml-7 inline peer-focus:text-green-500 peer-checked:hidden"
    />
    <Icon
      name="radioF"
      className="w-5 mr-2 -ml-7 text-green-500 hidden peer-checked:inline"
    />
  </>
)

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

  return (
    <div
      className={cn(
        'flex flex-col flex-shrink-0',
        variant === 'base' && 'pl-6'
      )}
    >
      <label className="items-center inline-flex">
        <input
          className="peer sr-only"
          checked={checked}
          name={name}
          onChange={onChange}
          required={required}
          type="radio"
          value={value}
          {...ariaProps}
        />
        {variant === 'base' && radioIcons}
        <span className={cn('text-sm', variant === 'card' && cardLabel)}>
          {children}
        </span>
      </label>
      {hint && <HintText id={hintId}>{hint}</HintText>}
    </div>
  )
}
