import React from 'react'
import cn from 'classnames'
import { Alert } from '@reach/alert'
import type { FieldValidator } from 'formik'
import { ErrorMessage, Field } from 'formik'

// would prefer to refer directly to the props of Field and pass them all
// through, but couldn't get it to work. FieldAttributes<string> is closest but
// it makes a bunch of props required that should be optional. Instead we simply
// take the props of an input field (which are part of the Field props) and
// manually tack on validate. Omit `type` because this is always a text field.
export type TextFieldProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  validate?: FieldValidator
  // error is used to style the wrapper, also to put aria-invalid on the input
  error?: boolean
  disabled?: boolean
  className?: string
}

export const TextField = ({
  error,
  className,
  ...fieldProps
}: TextFieldProps) => (
  <div
    className={cn(
      'flex rounded border border-gray-400',
      'focus-within:border-green-500 hover:focus-within:border-green-500',
      error && '!border-red-500',
      !fieldProps.disabled && 'hover:border-gray-300',
      className
    )}
  >
    <Field
      type="text"
      className={`
        text-sm w-full border-none
        bg-transparent py-[0.5625rem] px-3 
        font-sans text-gray-50 focus:outline-none`}
      aria-invalid={error}
      placeholder=""
      {...fieldProps}
    />
  </div>
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
    className={cn('text-sm mb-2 font-sans font-light text-gray-50', className)}
  >
    {children}
  </div>
)

// min-h so when error is one line (hopefully almost all the time) there is
// already space for the error to appear in, and following content doesn't get
// pushed down
export const TextFieldError = ({ name }: { name: string }) => (
  <div className="ml-px min-h-[2.25rem]">
    <ErrorMessage name={name}>
      {(msg) =>
        msg && (
          <Alert className="text-xs py-2 px-3 font-mono uppercase text-red-500">
            {msg}
          </Alert>
        )
      }
    </ErrorMessage>
  </div>
)
