/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import cn from 'classnames'
import { Link, type LinkProps } from 'react-router-dom'

import { AddRoundel12Icon } from '@oxide/design-system/icons/react'

import { Button, buttonStyle, type ButtonProps } from '~/ui/lib/Button'

export const CreateButton = ({ children, ...props }: ButtonProps) => (
  <Button size="sm" className="shrink-0" {...props}>
    <AddRoundel12Icon
      // dim the icon color from the default (text accent) because it looks a
      // lot brighter than text, but default disabled color is fine
      className={cn('mr-2', { 'text-accent-secondary': !props.disabled })}
    />
    {children}
  </Button>
)

export const CreateLink = ({ children, ...rest }: LinkProps) => (
  <Link className={buttonStyle({ size: 'sm' })} {...rest}>
    <AddRoundel12Icon className="mr-2 text-accent-secondary" />
    {children}
  </Link>
)
