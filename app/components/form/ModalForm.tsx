/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useId, type ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import type { ApiError } from '@oxide/api'

import { Message } from '~/ui/lib/Message'
import { Modal, type ModalProps } from '~/ui/lib/Modal'

type ModalFormProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  children: ReactNode
  /** Must be provided with a reason describing why it's disabled */
  submitDisabled?: string
  onSubmit: (values: TFieldValues) => void
  submitLabel: string
  // require loading and error so we can't forget to hook them up. there are a
  // few forms that don't need them, so we'll use dummy values

  /** Error from the API call */
  submitError: ApiError | null
  loading: boolean
} & Omit<ModalProps, 'isOpen'>

export function ModalForm<TFieldValues extends FieldValues>({
  form,
  children,
  onDismiss,
  submitDisabled,
  submitError,
  title,
  onSubmit,
  submitLabel = 'Save',
  loading,
  width = 'medium',
  overlay = true,
}: ModalFormProps<TFieldValues>) {
  const id = useId()

  const { isSubmitting } = form.formState

  return (
    <>
      <Modal isOpen onDismiss={onDismiss} title={title} width={width} overlay={overlay}>
        <Modal.Body>
          <Modal.Section>
            {submitError && (
              <Message variant="error" title="Error" content={submitError.message} />
            )}
            <form
              id={id}
              className="ox-form"
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
          </Modal.Section>
        </Modal.Body>
        <Modal.Footer
          onDismiss={onDismiss}
          formId={id}
          actionText={submitLabel}
          disabled={!!submitDisabled}
          actionLoading={loading || isSubmitting}
        />
      </Modal>
    </>
  )
}
