import type { ReactElement, ReactNode } from 'react'
import { cloneElement } from 'react'
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import type { ErrorResult } from '@oxide/api'
import { PageHeader, PageTitle } from '@oxide/ui'
import { classed, flattenChildren, pluckFirstOfType } from '@oxide/util'

import { PageActions } from '../PageActions'
import { Form } from '../form/Form'

interface FullPageFormProps<TFieldValues extends FieldValues> {
  id: string
  title: string
  icon: ReactElement
  submitDisabled?: boolean
  error?: Error
  formOptions: UseFormProps<TFieldValues>
  onSubmit: (values: TFieldValues) => Promise<void>
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
  children: (form: UseFormReturn<TFieldValues>) => ReactNode
}

const PageActionsContainer = classed.div`flex h-20 items-center gutter`

export function FullPageForm<TFieldValues extends FieldValues>({
  id,
  title,
  children,
  submitDisabled = false,
  error,
  icon,
  formOptions,
  onSubmit,
}: FullPageFormProps<TFieldValues>) {
  const form = useForm(formOptions)
  const { isSubmitting, isDirty } = form.formState

  const childArray = flattenChildren(children(form))
  const actions = pluckFirstOfType(childArray, Form.Actions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={icon}>{title}</PageTitle>
      </PageHeader>
      <form className="ox-form pb-20" id={id} onSubmit={form.handleSubmit(onSubmit)}>
        {childArray}
      </form>
      {actions && (
        <PageActions>
          <PageActionsContainer>
            {cloneElement(actions, {
              formId: id,
              submitDisabled: submitDisabled || isSubmitting || !isDirty,
              error,
            })}
          </PageActionsContainer>
        </PageActions>
      )}
    </>
  )
}
