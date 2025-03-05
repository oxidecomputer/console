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
  /**
   * A function that returns the fields.
   *
   * Implemented as a function so we can pass `control` to the fields in the
   * calling code. We could do that internally with `cloneElement` instead, but
   * then in the calling code, the field would not infer `TFieldValues` and
   * constrain the `name` prop to paths in the values object.
   */
  children: ReactNode
  resourceName: string
  /** Must be provided with a reason describing why it's disabled */
  submitDisabled?: string

  // require loading and error so we can't forget to hook them up. there are a
  // few forms that don't need them, so we'll use dummy values

  /** Error from the API call */
  submitError: ApiError | null
  loading: boolean

  /** Only needed if you need to override the default title (Create/Edit ${resourceName}) */
  subtitle?: ReactNode
  onSubmit: (values: TFieldValues) => void

  submitLabel?: string
} & Omit<ModalProps, 'isOpen'>

export function ModalForm<TFieldValues extends FieldValues>({
  form,
  children,
  onDismiss,
  resourceName,
  submitDisabled,
  submitError,
  title,
  onSubmit,
  submitLabel = 'Save',
  loading,
  subtitle,
  width = 'medium',
  overlay = true,
}: ModalFormProps<TFieldValues>) {
  const id = useId()

  const { isSubmitting } = form.formState

  const modalTitle = title || `Create ${resourceName}`

  return (
    <>
      <Modal
        isOpen
        onDismiss={onDismiss}
        title={modalTitle}
        width={width}
        overlay={overlay}
      >
        <Modal.Body>
          <Modal.Section>
            {subtitle && <div className="mb-4">{subtitle}</div>}
            {submitError && (
              <Message variant="error" title="Error" content={submitError.message} />
            )}
            <form
              id={id}
              className="ox-form"
              autoComplete="off"
              onSubmit={(e) => {
                if (!onSubmit) return
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
