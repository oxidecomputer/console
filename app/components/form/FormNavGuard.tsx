/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { type FieldValues, type UseFormReturn } from 'react-hook-form'
import { useBlocker } from 'react-router-dom'

import { Modal } from '~/ui/lib/Modal'

export function FormNavGuard<TFieldValues extends FieldValues>({
  form,
}: {
  form: UseFormReturn<TFieldValues>
}) {
  const { isDirty, isSubmitting, isSubmitSuccessful } = form.formState
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

  return isSubmitting || isSubmitSuccessful ? null : (
    <Modal
      isOpen={blocker.state === 'blocked'}
      onDismiss={() => blocker.reset?.()}
      title="Confirm navigation"
    >
      <Modal.Section>
        Are you sure you want to leave this form? Your progress will be lost.
      </Modal.Section>
      <Modal.Footer
        onDismiss={() => blocker.reset?.()}
        onAction={() => blocker.proceed?.()}
        cancelText="Keep editing"
        actionText="Leave form"
        actionType="danger"
      />
    </Modal>
  )
}
