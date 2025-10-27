/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { announce } from '@react-aria/live-announcer'
import cn from 'classnames'
import { useEffect } from 'react'
import type { Merge } from 'type-fest'

import { CopyToClipboard } from './CopyToClipboard'

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
export type TextInputBaseProps = Merge<
  React.ComponentPropsWithRef<'input'>,
  {
    // error is used to style the wrapper, also to put aria-invalid on the input
    error?: boolean
    disabled?: boolean
    className?: string
    fieldClassName?: string
    copyable?: boolean
    // by default, number and string[] are allowed, but we want to be simple
    value?: string
  }
>

export function TextInput({
  type = 'text',
  value,
  error,
  className,
  disabled,
  fieldClassName,
  copyable,
  as: asProp,
  ref,
  ...fieldProps
}: TextInputBaseProps & TextAreaProps) {
  const Component = asProp || 'input'
  return (
    <div
      className={cn(
        'flex items-center rounded border',
        error
          ? 'border-error-secondary hover:border-error'
          : 'border-default hover:border-hover',
        disabled && 'border-default!',
        className
      )}
    >
      <Component
        // @ts-expect-error this is fine, it's just mad because Component is a variable
        ref={ref}
        type={type}
        value={value}
        className={cn(
          `text-sans-md text-raise bg-default placeholder:text-tertiary disabled:text-secondary disabled:bg-disabled w-full rounded border-none px-3 py-2.75 outline-offset-1! disabled:cursor-not-allowed`,
          error && 'focus-error',
          fieldClassName,
          disabled && 'text-disabled bg-disabled',
          copyable && 'pr-0'
        )}
        aria-invalid={error}
        disabled={disabled}
        spellCheck={false}
        {...fieldProps}
      />
      {copyable && (
        <CopyToClipboard
          text={value || ''}
          className="bg-disabled border-default h-10! rounded-none border-l border-solid px-4"
        />
      )}
    </div>
  )
}

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
  <div
    id={id}
    className={cn(
      'text-sans-sm text-secondary hover:[&_>_a]:text-raise mt-1 [&_>_a]:underline',
      className
    )}
  >
    {children}
  </div>
)

export const TextInputError = ({ children }: { children: string }) => {
  useEffect(() => announce(children, 'assertive'), [children])
  return <div className="text-sans-md text-destructive ml-px py-2">{children}</div>
}
