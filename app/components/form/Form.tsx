/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { cloneElement } from 'react'

import { Error12Icon } from '@oxide/design-system/icons/react'
import { flattenChildren, invariant, isOneOf, pluckFirstOfType } from '@oxide/util'

import { Button, type ButtonProps } from '~/ui/lib/Button'
import { classed } from '~/util/classed'

import './form.css'

interface FormActionsProps {
  formId?: string
  children: React.ReactNode
  /** Must be provided with a reason why the submit button is disabled */
  submitDisabled?: string
  loading?: boolean
  error?: { message: string } | null
  className?: string
}

export const Form = {
  /**
   * This component is the area at the bottom of a form that contains
   * the submit button and any other actions. The first button is automatically
   * given a type of "submit." Default styles are applied all buttons but can be
   * overridden.
   */
  Actions: ({
    children,
    formId,
    submitDisabled,
    error,
    className,
    loading,
  }: FormActionsProps) => {
    const childArray = flattenChildren(children)

    invariant(
      isOneOf(childArray, [Form.Submit, Form.Cancel, Button]),
      'Form.Actions should only receive Button components as children'
    )

    const submit = pluckFirstOfType(childArray, Form.Submit)

    invariant(submit, 'Form.Actions must contain a Form.Submit component')

    return (
      <div
        className={cn(
          'flex w-full items-center gap-[0.625rem] children:shrink-0',
          className
        )}
      >
        {cloneElement(submit, {
          form: formId,
          disabled: !!submitDisabled,
          disabledReason: submitDisabled,
          loading,
        })}
        {childArray}
        {error && (
          <div className="flex !shrink grow items-start justify-end text-mono-sm text-error">
            <Error12Icon className="mx-2 mt-0.5 shrink-0" />
            <span>{error.message}</span>
          </div>
        )}
      </div>
    )
  },

  Submit: (props: ButtonProps) => <Button type="submit" size="sm" {...props} />,

  Cancel: (props: ButtonProps) => (
    <Button variant="ghost" size="sm" {...props}>
      Cancel
    </Button>
  ),

  Heading: classed.h2`text-content text-sans-2xl`,
}
