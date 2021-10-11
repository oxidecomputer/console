/**
 * Radio and RadioCard components with identical props APIs.
 *
 * Usage: just like a plain input, except that you should not pass name
 * explicitly. Instead rely on the parent RadioGroup to do that. The other
 * difference is that label content is handled through children.
 */

import React from 'react'
import cn from 'classnames'
import { Field } from 'formik'
import styles from './radio.module.css'

// input type is fixed to "radio"
type Props = Omit<React.ComponentProps<'input'>, 'type'>

const fieldStyles = `
  peer appearance-none absolute outline-none
  border border-gray-300 h-4 w-4 rounded-full
  hover:bg-gray-400 hover:checked:bg-green-950
  focus:ring-2 focus:ring-green-700
  checked:bg-green-900 checked:border-green-500
  disabled:hover:bg-transparent
`

export const Radio = ({ children, ...inputProps }: Props) => (
  <label className="0x-radio inline-flex items-center">
    <span className="h-4 w-4 relative">
      <Field className={fieldStyles} type="radio" {...inputProps} />
      {/* the dot in the middle. hide by default, use peer-checked to show if checked */}
      <div className="hidden peer-checked:block absolute w-2 h-2 left-1 top-1 rounded-full bg-green-500" />
    </span>

    <span className="text-xs uppercase font-mono ml-2.5">{children}</span>
  </label>
)

const cardLabelStyles = `
  text-sm bg-gray-500 border rounded border-gray-400 
  hover:text-green-500 hover:border-green-500 peer-focus:ring-2 peer-focus:ring-green-700
  peer-checked:bg-green-900 peer-checked:border-green-500 peer-checked:text-green-500
  peer-disabled:hover:text-gray-100 peer-disabled:text-gray-100
`

export const RadioCard = ({ children, className, ...inputProps }: Props) => (
  <label className={cn('items-center inline-flex font-mono', className)}>
    <Field className="peer sr-only" type="radio" {...inputProps} />
    <span className={cn(styles.children, cardLabelStyles, 'divide-y')}>
      {children}
    </span>
  </label>
)
