/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { cloneElement, type ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import type { ApiError } from '@oxide/api'

import { FormNavGuard } from '~/components/form/FormNavGuard'
import { flattenChildren, pluckFirstOfType } from '~/util/children'
import { classed } from '~/util/classed'

import { Form } from '../form/Form'
import { PageActions } from '../PageActions'

interface FullPageFormProps<TFieldValues extends FieldValues> {
  id: string
  /** Must provide a reason for submit being disabled */
  submitDisabled?: string
  error?: Error
  form: UseFormReturn<TFieldValues>
  loading?: boolean
  /**
   * Use await mutateAsync(), otherwise you'll break the logic below that relies
   * on knowing when the submit is done.
   */
  onSubmit: (values: TFieldValues) => Promise<void>
  /** Error from the API call */
  submitError: ApiError | null
  /**
   * A function that returns the fields.
   *
   * Implemented as a function so we can pass `control` to the fields in the
   * calling code. We could do that internally with `cloneElement` instead, but
   * then in the calling code, the field would not infer `TFieldValues` and
   * constrain the `name` prop to paths in the values object.
   */
  children: ReactNode
}

const PageActionsContainer = classed.div`flex h-20 items-center gutter`

export function FullPageForm<TFieldValues extends FieldValues>({
  id,
  children,
  submitDisabled,
  error,
  loading,
  form,
  onSubmit,
  submitError,
}: FullPageFormProps<TFieldValues>) {
  const { isSubmitting } = form.formState
  const childArray = flattenChildren(children)
  const actions = pluckFirstOfType(childArray, Form.Actions)

  return (
    <>
      <form
        className="ox-form pb-20"
        id={id}
        onSubmit={async (e) => {
          // This modal being in a portal doesn't prevent the submit event
          // from bubbling up out of the portal. Normally that's not a
          // problem, but sometimes (e.g., instance create) we render the
          // SideModalForm from inside another form, in which case submitting
          // the inner form submits the outer form unless we stop propagation
          e.stopPropagation()
          // Important to await here so isSubmitSuccessful doesn't become true
          // until the submit is actually successful. Note you must use await
          // mutateAsync() inside onSubmit in order to make this wait
          await form.handleSubmit(onSubmit)(e)
        }}
        autoComplete="off"
      >
        {childArray}
        <FormNavGuard form={form} />
      </form>

      {actions && (
        <PageActions>
          <PageActionsContainer>
            {cloneElement(actions, {
              formId: id,
              submitDisabled,
              loading: loading || isSubmitting,
              error: error || submitError,
            })}
          </PageActionsContainer>
        </PageActions>
      )}
    </>
  )
}
