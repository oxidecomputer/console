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
      'flex rounded border border-default',
      'focus-within:border-accent hover:focus-within:border-accent',
      error && '!border-destructive',
      !fieldProps.disabled && 'hover:border-raise',
      className
    )}
  >
    <Field
      type="text"
      className={cn(
        `w-full border-none bg-transparent
        py-[0.5625rem] px-3
        text-sans-md text-default focus:outline-none disabled:text-tertiary disabled:bg-disabled`,
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
  <div id={id} className={cn('mb-2 text-sans-sm text-secondary', className)}>
    {children}
  </div>
)

export const TextFieldError = ({ name }: { name: string }) => (
  <div className="ml-px">
    <ErrorMessage name={name}>
      {(msg) => msg && <Alert className="py-2 text-mono-sm text-destructive">{msg}</Alert>}
    </ErrorMessage>
  </div>
)
