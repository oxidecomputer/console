/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import * as m from 'motion/react-m'
import { type MouseEventHandler, type ReactNode } from 'react'

import { type BadgeColor } from '@oxide/design-system/ui'

import { Spinner } from '~/ui/lib/Spinner'
import { Tooltip } from '~/ui/lib/Tooltip'
import { Wrap } from '~/ui/util/wrap'

export const buttonSizes = ['sm', 'icon', 'base'] as const
export const variants = ['primary', 'secondary', 'ghost', 'danger'] as const

export type ButtonSize = (typeof buttonSizes)[number]
export type Variant = (typeof variants)[number]

const sizeStyle: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-mono-sm [&>svg]:w-4',
  // meant for buttons that only contain a single icon
  icon: 'h-8 w-8 text-mono-sm [&>svg]:w-4',
  base: 'h-10 px-4 text-mono-sm [&>svg]:w-5',
}

const variantToBadgeColorMap: Record<Variant, BadgeColor> = {
  primary: 'default',
  danger: 'destructive',
  secondary: 'neutral',
  ghost: 'neutral',
}

type ButtonStyleProps = {
  size?: ButtonSize
  variant?: Variant
}

export const buttonStyle = ({
  size = 'base',
  variant = 'primary',
}: ButtonStyleProps = {}) => {
  return cn(
    'ox-button active-clicked rounded-md inline-flex items-center justify-center align-top disabled:cursor-default shrink-0',
    `btn-${variant}`,
    sizeStyle[size],
    variant === 'danger'
      ? 'focus-visible:outline-destructive-secondary'
      : 'focus-visible:outline-accent-secondary'
  )
}

/**
 * When the `disabled` prop is passed to the button we put it in a visually disabled state.
 * In that case we want to override the default mouse down and click behavior to simulate a
 * disabled state.
 */
const noop: MouseEventHandler<HTMLButtonElement> = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

export interface ButtonProps extends React.ComponentProps<'button'>, ButtonStyleProps {
  innerClassName?: string
  loading?: boolean
  disabledReason?: ReactNode
}

// The ref situation is a little confusing. We need a ref prop for the button
// (and to pass it through to <button> so it actually does something) so we can
// focus to the button programmatically. There is an example in TlsCertsField
// in the silo create form: when there are no certs added, the validation error
// on submit focuses and scrolls to the add TLS cert button. All of that is
// normal. The confusing part is that when the button is disabled and wrapped
// in a tooltip, the tooltip component wants to add its own ref to the button
// so it can figure out where to place the tooltip. In order to make both refs
// work at the same time (so that, for example, in theory, a button could be
// simultaneously disabled with a tooltip *and* be focused programmatically [I
// tested this]), we merge the two refs inside Tooltip, using child.props.ref to
// get the original ref on the button.

export const Button = ({
  type = 'button',
  children,
  size,
  variant,
  className,
  loading,
  innerClassName,
  disabled,
  onClick,
  disabledReason,
  // needs to be a spread because we sometimes get passed arbitrary <button>
  // props by the parent
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || loading
  return (
    <Wrap
      when={isDisabled && disabledReason}
      with={<Tooltip content={disabledReason} placement="bottom" />}
    >
      <button
        className={cn(
          buttonStyle({ size, variant }),
          className,
          { 'visually-disabled': isDisabled },
          'overflow-hidden'
        )}
        /* eslint-disable-next-line react/button-has-type */
        type={type}
        onMouseDown={isDisabled ? noop : undefined}
        onClick={isDisabled ? noop : onClick}
        aria-disabled={isDisabled}
        /* this includes the ref. that's important. see big comment above */
        {...rest}
      >
        {loading && (
          <m.span
            animate={{ opacity: 1, y: '-50%', x: '-50%' }}
            initial={{ opacity: 0, y: 'calc(-50% - 25px)', x: '-50%' }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            className="absolute top-1/2 left-1/2 flex items-center justify-center"
          >
            <Spinner variant={variantToBadgeColorMap[variant || 'primary']} />
          </m.span>
        )}
        <m.span
          className={cn('flex items-center', innerClassName)}
          animate={{
            opacity: loading ? 0 : 1,
            y: loading ? 25 : 0,
          }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        >
          {children}
        </m.span>
      </button>
    </Wrap>
  )
}
