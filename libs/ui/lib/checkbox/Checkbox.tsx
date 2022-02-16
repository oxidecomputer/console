import React from 'react'
import type { FieldAttributes } from 'formik'
import { Field } from 'formik'

import { Checkmark12Icon } from '@oxide/ui'
import { classed } from '@oxide/util'
import cn from 'classnames'

const Check = () => (
  <Checkmark12Icon className="absolute left-0.5 top-0.5 h-2.5 w-3 fill-current text-accent" />
)

const Indeterminate = classed.div`absolute w-2 h-0.5 left-1 top-[7px] bg-accent`

const inputStyle = `
  appearance-none border border-default bg-default h-4 w-4 rounded-sm absolute left-0 outline-none
  disabled:cursor-not-allowed
  focus:ring-2 focus:ring-accent-secondary
  hover:bg-secondary
  checked:bg-accent-secondary checked:border-accent hover:checked:bg-accent-secondary-hover
  indeterminate:bg-accent-secondary indeterminate:border-accent hover:indeterminate:bg-accent-secondary-hover
`

export type CheckboxProps = {
  indeterminate?: boolean
  children?: React.ReactNode
  className?: string
} & Omit<React.ComponentProps<'input'>, 'type'>

// ref function is from: https://davidwalsh.name/react-indeterminate. this makes
// the native input work with indeterminate. you can't pass indeterminate as a
// prop; it has to be set directly on the element through a ref. more elaborate
// examples using forwardRef to allow passing ref from outside:
// https://github.com/tannerlinsley/react-table/discussions/1989

/** Checkbox component that handles label, styling, and indeterminate state */
export const Checkbox = ({
  indeterminate,
  children,
  className,
  ...inputProps
}: CheckboxProps) => (
  <label className="inline-flex items-center">
    <span className="relative h-4 w-4">
      <input
        className={cn(inputStyle, className)}
        type="checkbox"
        ref={(el) => el && (el.indeterminate = !!indeterminate)}
        {...inputProps}
      />
      {inputProps.checked && !indeterminate && <Check />}
      {indeterminate && <Indeterminate />}
    </span>

    {children && (
      <span className="ml-2.5 text-sans-md text-secondary">{children}</span>
    )}
  </label>
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CheckboxFieldProps = CheckboxProps & Omit<FieldAttributes<any>, 'type'>

/** Formik Field version of Checkbox */
export const CheckboxField = (props: CheckboxFieldProps) => (
  <Field type="checkbox" as={Checkbox} {...props} />
)
