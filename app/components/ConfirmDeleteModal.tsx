import { Message, Modal } from '@oxide/ui'
import { classed } from '@oxide/util'

import { clearConfirmDelete, useConfirmDelete } from 'app/stores/confirm-delete'
import { addToast } from 'app/stores/toast'

export const HL = classed.span`text-sans-semi-md text-default`

export function ConfirmDeleteModal() {
  const deleteConfig = useConfirmDelete((state) => state.deleteConfig)

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
          await doDelete().catch((error) =>
            addToast({
              variant: 'error',
              title: 'Could not delete resource',
              content: error.message,
            })
          )
          // TODO: generic success toast?
          clearConfirmDelete()
        }}
        cancelText="Cancel"
        actionText="Confirm"
        actionType="danger"
      />
    </Modal>
  )
}
