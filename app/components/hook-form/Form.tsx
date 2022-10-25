import cn from 'classnames'
import type { ReactNode } from 'react'
import { cloneElement } from 'react'
import invariant from 'tiny-invariant'

import type { ButtonProps } from '@oxide/ui'
import { Error12Icon } from '@oxide/ui'
import { Button } from '@oxide/ui'
import { addProps, classed, flattenChildren, isOneOf, pluckFirstOfType } from '@oxide/util'

import 'app/components/form/form.css'

export interface FormProps {
  id: string
  className?: string
  children: ReactNode
  // TODO: onSubmit?
}

interface FormActionsProps {
  formId?: string
  children: React.ReactNode
  submitDisabled?: boolean
  error?: Error | null
  className?: string
}

// doing it this way because there is no Form itself anymore
// TODO: probably rework these names because there's no Form anymore
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
    submitDisabled = true,
    error,
    className,
  }: FormActionsProps) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const childArray = flattenChildren(children).map(
      addProps<typeof Button>((i, props) => ({
        size: 'sm',
        ...props,
      }))
    )

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
        {cloneElement(submit, { form: formId, disabled: submitDisabled })}
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

  Submit: (props: ButtonProps) => <Button type="submit" variant="default" {...props} />,

  Cancel: (props: ButtonProps) => (
    <Button variant="ghost" color="secondary" {...props}>
      Cancel
    </Button>
  ),

  Heading: classed.h2`ox-form-heading text-content text-sans-light-2xl`,
}
export interface FormSectionProps {
  id?: string
  children: React.ReactNode
  title: string
}
