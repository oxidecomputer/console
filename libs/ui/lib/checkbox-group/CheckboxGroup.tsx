/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import React from 'react'

import { classed } from '@oxide/util'

export const CheckboxGroupHint = classed.p`text-base text-secondary text-sans-sm max-w-3xl`

export type CheckboxGroupProps = {
  name: string
  children: React.ReactElement | React.ReactElement[]
  required?: boolean
  disabled?: boolean
  column?: boolean
  className?: string
  defaultChecked?: string[]
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const CheckboxGroup = ({
  name,
  defaultChecked,
  children,
  required,
  disabled,
  column,
  className,
  onChange,
  ...props
}: CheckboxGroupProps) => (
  <div
    className={cn('flex', column ? 'flex-col space-y-2' : 'flex-wrap gap-5', className)}
    role="group"
    onChange={onChange}
    {...props}
  >
    {React.Children.map(children, (checkbox) =>
      React.cloneElement(checkbox, {
        name,
        required,
        disabled,
        defaultChecked: defaultChecked?.includes(checkbox.props.value),
      })
    )}
  </div>
)
