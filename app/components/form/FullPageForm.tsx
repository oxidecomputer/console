import type { ReactElement, ReactNode } from 'react'
import { useState } from 'react'
import { cloneElement } from 'react'
import type { Control, FieldValues, UseFormProps } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import type { ErrorResult } from '@oxide/api'
import { PageHeader, PageTitle } from '@oxide/ui'
import { classed, flattenChildren, pluckFirstOfType } from '@oxide/util'

import { PageActions } from '../PageActions'
import { Form } from './Form'

interface FullPageFormProps<TFieldValues extends FieldValues> {
  id: string
  title: string
  icon: ReactElement
  submitDisabled?: boolean
  error?: Error
  formOptions: UseFormProps<TFieldValues>
  /** Error from the API call */
  submitError: ErrorResult | null
  /**
   * A function that returns the fields.
   *
   * Implemented as a function so we can pass `control` to the fields in the
   * calling code. We could do that internally with `cloneElement` instead, but
   * then in the calling code, the field would not infer `TFieldValues` and
   * constrain the `name` prop to paths in the values object.
   */
  children: (control: Control<TFieldValues>) => ReactNode
}

const PageActionsContainer = classed.div`flex h-20 items-center gutter`

export function FullPageForm<Values extends Record<string, unknown>>({
  id,
  title,
  children,
  submitDisabled = false,
  error,
  icon,
  formOptions,
}: FullPageFormProps<Values>) {
  const [submitState, setSubmitState] = useState(true)
  const childArray = flattenChildren(children)
  const actions = pluckFirstOfType(childArray, Form.Actions)
  const { control } = useForm(formOptions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={icon}>{title}</PageTitle>
      </PageHeader>
      <form className="pb-20" id={id}>
        {children(control)}
      </form>
      {actions && (
        <PageActions>
          <PageActionsContainer>
            {cloneElement(actions, {
              formId: id,
              submitDisabled: submitDisabled || !submitState,
              error,
            })}
          </PageActionsContainer>
        </PageActions>
      )}
    </>
  )
}
