/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import { type ApiError } from '@oxide/api'

import { Modal } from '~/ui/lib/Modal'
import { clearConfirmAction, useConfirmAction } from 'app/stores/confirm-action'
import { addToast } from 'app/stores/toast'

export function ConfirmActionModal() {
  const actionConfig = useConfirmAction((state) => state.actionConfig)

  // this is a bit sad -- ideally we would be able to use the loading state
  // from the mutation directly, but that would require a lot of line changes
  // and would require us to hook this up in a way that re-renders whenever the
  // loading state changes
  const [loading, setLoading] = useState(false)

  if (!actionConfig) return null

  const { doAction, modalContent, errorTitle, modalTitle, actionType } = actionConfig

  return (
    <Modal isOpen onDismiss={clearConfirmAction} title={modalTitle}>
      <Modal.Section>{modalContent}</Modal.Section>
      <Modal.Footer
        onDismiss={clearConfirmAction}
        onAction={async () => {
          setLoading(true)
          try {
            await doAction()
          } catch (error) {
            addToast({
              variant: 'error',
              title: errorTitle,
              content: (error as ApiError).message,
            })
          }

          setLoading(false) // do this regardless of success or error

          // TODO: generic success toast?
          clearConfirmAction()
        }}
        cancelText="Cancel"
        actionText="Confirm"
        actionType={actionType}
        actionLoading={loading}
      />
    </Modal>
  )
}
