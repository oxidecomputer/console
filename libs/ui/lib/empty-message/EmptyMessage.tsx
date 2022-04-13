import React from 'react'
import type { LinkProps } from 'react-router-dom'
import { Link } from 'react-router-dom'
import cn from 'classnames'

import { classed } from '@oxide/util'
import { type ButtonProps, Button, buttonStyle } from '../button/Button'

const buttonStyleProps = { variant: 'ghost', size: 'xs', color: 'neutral' } as const

export const EmptyMessage = {
  Outer: classed.div`flex flex-col items-center max-w-[14rem] text-center m-4`,
  Icon: classed.div`text-accent bg-accent-secondary p-1 leading-[0] rounded mb-4`,
  Header: classed.h3`text-sans-semi-lg`,
  Body: classed.p`text-sans-sm text-secondary mt-1`,

  // TODO: this is pretty silly to just get a Link and a Button with the same
  // styling. there has to be a better way?

  Button: ({ children, className, ...rest }: ButtonProps) => (
    <Button {...buttonStyleProps} className={cn('mt-6', className)} {...rest}>
      {children}
    </Button>
  ),
  Link: ({ children, className, ...rest }: LinkProps) => (
    <Link className={cn('mt-6', buttonStyle(buttonStyleProps), className)} {...rest}>
      {children}
    </Link>
  ),
}
