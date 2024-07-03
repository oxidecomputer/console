/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useId, type ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { NavigationType, useBlocker, useNavigationType } from 'react-router-dom'

import type { ApiError } from '@oxide/api'

import { Button } from '~/ui/lib/Button'
import { SideModal } from '~/ui/lib/SideModal'

import { ConfirmNavigation } from './ConfirmNavigation'

type CreateFormProps = {
  formType: 'create'
  /** Only needed if you need to override the default button text (`Create ${resourceName}`) */
  submitLabel?: string
}

type EditFormProps = {
  formType: 'edit'
  /** Not permitted, as all edit form buttons should read `Update ${resourceName}` */
  submitLabel?: never
}

type SideModalFormProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  /**
   * A function that returns the fields.
   *
   * Implemented as a function so we can pass `control` to the fields in the
   * calling code. We could do that internally with `cloneElement` instead, but
   * then in the calling code, the field would not infer `TFieldValues` and
   * constrain the `name` prop to paths in the values object.
   */
  children: ReactNode
  onDismiss: () => void
  resourceName: string
  /** Must be provided with a reason describing why it's disabled */
  submitDisabled?: string
  /** Error from the API call */
  submitError: ApiError | null
  loading?: boolean
  /** Only needed if you need to override the default title (Create/Edit ${resourceName}) */
  title?: string
  subtitle?: ReactNode
  onSubmit?: (values: TFieldValues) => void
} & (CreateFormProps | EditFormProps)

/**
 * Only animate the modal in when we're navigating by a client-side click.
 * Don't animate on a fresh pageload or on back/forward. The latter may be
 * slightly awkward but it also makes some sense. I do not believe there is
 * any way to distinguish between fresh pageload and back/forward.
 */
export function useShouldAnimateModal() {
  return useNavigationType() === NavigationType.Push
}

export function SideModalForm<TFieldValues extends FieldValues>({
  form,
  formType,
  children,
  onDismiss,
  resourceName,
  submitDisabled,
  submitError,
  title,
  onSubmit,
  submitLabel,
  loading,
  subtitle,
}: SideModalFormProps<TFieldValues>) {
  const id = useId()
  const { isSubmitting, isDirty, isSubmitSuccessful } = form.formState

  useEffect(() => {
    if (submitError?.errorCode === 'ObjectAlreadyExists' && 'name' in form.getValues()) {
      // @ts-expect-error
      form.setError('name', { message: 'Name already exists' })
    }
  }, [submitError, form])

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

  const label =
    formType === 'edit'
      ? `Update ${resourceName}`
      : submitLabel || title || `Create ${resourceName}`

  return (
    <SideModal
      onDismiss={onDismiss}
      isOpen
      title={title || `${formType === 'edit' ? 'Edit' : 'Create'} ${resourceName}`}
      animate={useShouldAnimateModal()}
      subtitle={subtitle}
      errors={submitError ? [submitError.message] : []}
    >
      <SideModal.Body>
        <form
          id={id}
          className="ox-form is-side-modal"
          autoComplete="off"
          onSubmit={(e) => {
            if (!onSubmit) return
            // This modal being in a portal doesn't prevent the submit event
            // from bubbling up out of the portal. Normally that's not a
            // problem, but sometimes (e.g., instance create) we render the
            // SideModalForm from inside another form, in which case submitting
            // the inner form submits the outer form unless we stop propagation
            e.stopPropagation()
            form.handleSubmit(onSubmit)(e)
          }}
        >
          {children}
        </form>
      </SideModal.Body>
      <SideModal.Footer error={!!submitError}>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Cancel
        </Button>
        {onSubmit && (
          <Button
            type="submit"
            size="sm"
            disabled={!!submitDisabled}
            disabledReason={submitDisabled}
            loading={loading || isSubmitting}
            form={id}
          >
            {label}
          </Button>
        )}
      </SideModal.Footer>
      {!isSubmitSuccessful && <ConfirmNavigation blocker={blocker} />}
    </SideModal>
  )
}
