/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { cloneElement, useEffect, type ReactElement, type ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { useBlocker, type Blocker } from 'react-router-dom'

import type { ApiError } from '@oxide/api'
import { PageHeader, PageTitle } from '@oxide/ui'
import { flattenChildren, pluckFirstOfType } from '@oxide/util'

import { Modal } from '~/ui/lib/Modal'
import { classed } from '~/util/classed'

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

  // Confirms with the user if they want to navigate away if the form is
  // dirty. Does not intercept everything e.g. refreshes or closing the tab
  // but serves to reduce the possibility of a user accidentally losing their
  // progress.
  const blocker = useBlocker(isDirty && !isSubmitSuccessful)

  // Gating on !isSubmitSuccessful above makes the blocker stop blocking nav
  // after a successful submit. However, this can take a little time (there is a
  // render in between when isSubmitSuccessful is true but the blocker is still
  // ready to block), so we also have this useEffect that lets blocked requests
  // through if submit is succesful but the blocker hasn't gotten a chance to
  // stop blocking yet.
  useEffect(() => {
    if (blocker.state === 'blocked' && isSubmitSuccessful) {
      blocker.proceed()
    }
  }, [blocker, isSubmitSuccessful])

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
          // Important to await here so isSubmitSuccessful doesn't become true
          // until the submit is actually successful. Note you must use await
          // mutateAsync() inside onSubmit in order to make this wait
          await form.handleSubmit(onSubmit)(e)
        }}
        autoComplete="off"
      >
        {childArray}
      </form>

      {/* rendering of the modal must be gated on isSubmitSuccessful because
          there is a brief moment where isSubmitSuccessful is true but the proceed() 
          hasn't fired yet, which means we get a brief flash of this modal */}
      {!isSubmitSuccessful && <ConfirmNavigation blocker={blocker} />}

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
