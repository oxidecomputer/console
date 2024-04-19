/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link, type LinkProps } from 'react-router-dom'

import { AddRoundel12Icon } from '@oxide/design-system/icons/react'

import { Button, buttonStyle, type ButtonProps } from '~/ui/lib/Button'

export const CreateButton = ({ children, ...props }: ButtonProps) => (
  <Button size="sm" className="shrink-0" {...props}>
    <AddRoundel12Icon className="mr-2" />
    {children}
  </Button>
)
export const CreateLink = (props: LinkProps) => {
  const { children, ...rest } = props
  return (
    <Link className={buttonStyle({ size: 'sm' })} {...rest}>
      <AddRoundel12Icon className="mr-2" />
      {children}
    </Link>
  )
}
