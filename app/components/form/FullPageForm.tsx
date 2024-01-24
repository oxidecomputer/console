/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { cloneElement, useEffect, type ReactElement, type ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { useBlocker, type unstable_Blocker as Blocker } from 'react-router-dom'

import type { ApiError } from '@oxide/api'
import { Modal, PageHeader, PageTitle } from '@oxide/ui'
import { classed, flattenChildren, pluckFirstOfType } from '@oxide/util'

import { Form } from '../form/Form'
import { PageActions } from '../PageActions'

interface FullPageFormProps<TFieldValues extends FieldValues> {
  id: string
  title: string
  icon: ReactElement
  /** Must provide a reason for submit being disabled */
  submitDisabled?: string
  error?: Error
  form: UseFormReturn<TFieldValues>
  loading?: boolean
  onSubmit: (values: TFieldValues) => void
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
  title,
  children,
  submitDisabled,
  error,
  icon,
  loading,
  form,
  onSubmit,
  submitError,
}: FullPageFormProps<TFieldValues>) {
  const { isSubmitting, isDirty, isSubmitSuccessful } = form.formState

  /*
    Confirms with the user if they want to navigate away
    if the form is dirty. Does not intercept everything e.g.
    refreshes or closing the tab but serves to reduce
    the possibility of a user accidentally losing their progress
  */
  // I think this would work if the nav didn't happen until after handleSubmit completes.
  // as it stands it's in a race because both the end of handleSubmit and the onSuccess
  // of the instance create mutation are kicked off by the completion of the create request
  const blocker = useBlocker(isDirty && !isSubmitSuccessful)
  console.log({ isSubmitting, isDirty, isSubmitSuccessful, blockerState: blocker.state })

  // Reset blocker if form is no longer dirty
  useEffect(() => {
    if (blocker.state === 'blocked' && !isDirty) {
      blocker.reset()
    }
  }, [blocker, isDirty])

  const childArray = flattenChildren(children)
  const actions = pluckFirstOfType(childArray, Form.Actions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={icon}>{title}</PageTitle>
      </PageHeader>
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
          console.log('a')
          await form.handleSubmit(onSubmit)(e)
          console.log('b')
        }}
        autoComplete="off"
      >
        {childArray}
      </form>

      {blocker ? <ConfirmNavigation blocker={blocker} /> : null}

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

const ConfirmNavigation = ({ blocker }: { blocker: Blocker }) => (
  <Modal
    isOpen={blocker.state === 'blocked'}
    onDismiss={() => blocker.reset?.()}
    title="Confirm navigation"
  >
    <Modal.Section>
      Are you sure you want to leave this page? <br /> You will lose all progress on this
      form.
    </Modal.Section>
    <Modal.Footer
      onDismiss={() => blocker.reset?.()}
      onAction={() => blocker.proceed?.()}
      cancelText="Continue editing"
      actionText="Leave this page"
      actionType="danger"
    />
  </Modal>
)
