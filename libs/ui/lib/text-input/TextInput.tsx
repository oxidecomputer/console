import { announce } from '@react-aria/live-announcer'
import cn from 'classnames'
import React, { useEffect } from 'react'

/**
 * This is a little complicated. We only want to allow the `rows` prop if
 * `as="textarea"`. But the derivatives of `TextField`, like `NameField`, etc.,
 * can't use `as` no matter what. So we have them only use `TextFieldBaseProps`,
 * which doesn't know about `as`. But `TextField` itself secretly takes
 * `TextFieldBaseProps & TextAreaProps`.
 */
export type TextAreaProps =
  | {
      as: 'textarea'
      /** Only used with `as="textarea"` */
      rows?: number
    }
  | {
      as?: never
      rows?: never
    }

// would prefer to refer directly to the props of Field and pass them all
// through, but couldn't get it to work. FieldAttributes<string> is closest but
// it makes a bunch of props required that should be optional. Instead we simply
// take the props of an input field (which are part of the Field props) and
// manually tack on validate.
export type TextInputBaseProps = React.ComponentPropsWithRef<'input'> & {
  // error is used to style the wrapper, also to put aria-invalid on the input
  error?: boolean
  disabled?: boolean
  className?: string
  fieldClassName?: string
}

export const TextInput = React.forwardRef<
  HTMLInputElement,
  TextInputBaseProps & TextAreaProps
>(
  (
    {
      type = 'text',
      error,
      className,
      disabled,
      fieldClassName,
      as: asProp,
      ...fieldProps
    },
    ref
  ) => {
    const Component = asProp || 'input'
    return (
      <div
        className={cn(
          'flex rounded border',
          error ? 'border-error' : 'border-default',
          'focus-within:ring-2',
          className
        )}
      >
        <Component
          // @ts-ignore this is fine, it's just mad because Component is a variable
          ref={ref}
          type={type}
          className={cn(
            `w-full rounded border-none py-[0.6875rem]
        px-3 !outline-offset-1 text-sans-md
        text-default bg-default placeholder:text-quaternary
        focus:outline-none disabled:cursor-not-allowed disabled:text-tertiary disabled:bg-disabled`,
            error && 'focus-error',
            fieldClassName,
            disabled && 'text-disabled bg-disabled'
          )}
          aria-invalid={error}
          disabled={disabled}
          {...fieldProps}
        />
      </div>
    )
  }
)

// TODO: do this properly: extract a NumberField that styles the up and down
// buttons for when we do want them *and* add a flag to hide them using
// appearance-textfield
export const NumberInput = ({
  fieldClassName,
  ...props
}: Omit<TextInputBaseProps, 'type'>) => (
  <TextInput
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
export const TextInputHint = ({ id, children, className }: HintProps) => (
  <div id={id} className={cn('mt-1 text-sans-sm text-tertiary', className)}>
    {children}
  </div>
)

export const TextInputError = ({ children }: { children: string }) => {
  useEffect(() => announce(children, 'assertive'), [children])
  return <div className="ml-px py-2 text-sans-md text-destructive">{children}</div>
}
