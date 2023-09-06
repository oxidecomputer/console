/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import { type ApiError } from '@oxide/api'
import { Message, Modal } from '@oxide/ui'
import { classed } from '@oxide/util'

import { clearConfirmDelete, useConfirmDelete } from 'app/stores/confirm-delete'
import { addToast } from 'app/stores/toast'

export const HL = classed.span`text-sans-semi-md text-default`

export function ConfirmDeleteModal() {
  const deleteConfig = useConfirmDelete((state) => state.deleteConfig)

  // this is a bit sad -- ideally we would be able to use the loading state
  // from the mutation directly, but that would require a lot of line changes
  // and would require us to hook this up in a way that re-renders whenever the
  // loading state changes
  const [loading, setLoading] = useState(false)

  if (!deleteConfig) return null

  const { doDelete, warning, label } = deleteConfig

  const displayLabel = typeof label === 'string' ? <HL>{label}</HL> : label

  return (
    <Modal isOpen onDismiss={clearConfirmDelete} title="Confirm delete">
      <Modal.Section>
        <p>Are you sure you want to delete {displayLabel}?</p>
        {warning && <Message variant="error" content={warning} />}
      </Modal.Section>
      <Modal.Footer
        onDismiss={clearConfirmDelete}
        onAction={async () => {
          setLoading(true)
          try {
            await doDelete()
          } catch (error) {
            addToast({
              variant: 'error',
              title: 'Could not delete resource',
              content: (error as ApiError).message,
            })
          }

          setLoading(false) // do this regardless of success or error

          // TODO: generic success toast?
          clearConfirmDelete()
        }}
        cancelText="Cancel"
        actionText="Confirm"
        actionType="danger"
        actionLoading={loading}
      />
    </Modal>
  )
}
