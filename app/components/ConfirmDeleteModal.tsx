import { Message, Modal } from '@oxide/ui'

import { clearConfirmDelete, useConfirmDelete } from 'app/stores/confirm-delete'

export function ConfirmDeleteModal() {
  const deleteConfig = useConfirmDelete((state) => state.deleteConfig)

  if (!deleteConfig) return null

  const { doDelete, warning, resourceName } = deleteConfig

  return (
    <Modal isOpen onDismiss={clearConfirmDelete} title="Confirm delete">
      <Modal.Section>
        <p>
          Are you sure you want to delete{' '}
          <span className="text-sans-semi-md text-default">{resourceName}</span>?
        </p>
        {warning && <Message variant="error" content={warning} />}
      </Modal.Section>
      <Modal.Footer
        onDismiss={clearConfirmDelete}
        onAction={() => {
          doDelete()
          clearConfirmDelete()
        }}
        cancelText="Cancel"
        actionText="Confirm"
        actionType="danger"
      />
    </Modal>
  )
}
