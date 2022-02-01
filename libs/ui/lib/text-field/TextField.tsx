import React from 'react'
import cn from 'classnames'
import { Alert } from '@reach/alert'
import type { FieldValidator } from 'formik'
import { ErrorMessage, Field } from 'formik'

// would prefer to refer directly to the props of Field and pass them all
// through, but couldn't get it to work. FieldAttributes<string> is closest but
// it makes a bunch of props required that should be optional. Instead we simply
// take the props of an input field (which are part of the Field props) and
// manually tack on validate.
export type TextFieldProps = React.ComponentProps<'input'> & {
  validate?: FieldValidator
  // error is used to style the wrapper, also to put aria-invalid on the input
  error?: boolean
  disabled?: boolean
  className?: string
  fieldClassName?: string
}

export const TextField = ({
  error,
  className,
  fieldClassName,
  ...fieldProps
}: TextFieldProps) => (
  <div
    className={cn(
      'flex border border-gray-400 rounded',
      'focus-within:border-green-500 hover:focus-within:border-green-500',
      error && '!border-red-500',
      !fieldProps.disabled && 'hover:border-gray-300',
      className
    )}
  >
    <Field
      className={cn(
        `py-[0.5625rem] px-3 w-full
        text-sm font-sans text-gray-50 
        bg-transparent border-none focus:outline-none`,
        fieldClassName
      )}
      aria-invalid={error}
      placeholder=""
      {...fieldProps}
    />
  </div>
)

// TODO: do this properly: extract a NumberField that styles the up and down
// buttons for when we do want them *and* add a flag to hide them using
// appearance-textfield
export const NumberTextField = ({
  fieldClassName,
  ...props
}: Omit<TextFieldProps, 'type'>) => (
  <TextField
    type="number"
    {...props}
    fieldClassName={cn(fieldClassName, 'appearance-textfield')}
  />
)

type HintProps = {
  // ID required as a reminder to pass aria-describedby on TextField
  id: string
  children: React.ReactNode
  className?: string
}

/**
 * Pass id here and include that ID in aria-describedby on the TextField
 */
export const TextFieldHint = ({ id, children, className }: HintProps) => (
  <div
    id={id}
    className={cn('text-sm font-sans font-light mb-2 text-gray-50', className)}
  >
    {children}
  </div>
)

// min-h so when error is one line (hopefully almost all the time) there is
// already space for the error to appear in, and following content doesn't get
// pushed down
export const TextFieldError = ({ name }: { name: string }) => (
  <div className="min-h-[2.25rem] ml-px">
    <ErrorMessage name={name}>
      {(msg) =>
        msg && (
          <Alert className="font-mono uppercase text-red-500 text-xs py-2 px-3">
            {msg}
          </Alert>
        )
      }
    </ErrorMessage>
  </div>
)
