import { Message, Modal } from '@oxide/ui'

import { useConfirmDelete } from 'app/stores/confirm-delete'

export function ConfirmDeleteModal() {
  const deleteConfig = useConfirmDelete((state) => state.deleteConfig)
  const clear = useConfirmDelete((state) => state.clear)

  if (!deleteConfig) return null

  const { doDelete, warning, resourceName } = deleteConfig

  return (
    <Modal isOpen onDismiss={clear} title="Confirm delete">
      <Modal.Section>
        <p>
          Are you sure you want to delete{' '}
          <span className="text-sans-semi-md text-default">{resourceName}</span>?
        </p>
        {warning && <Message variant="error" content={warning} />}
      </Modal.Section>
      <Modal.Footer
        onDismiss={clear}
        onAction={() => {
          doDelete()
          clear()
        }}
        cancelText="Cancel"
        actionText="Confirm"
        actionType="danger"
      />
    </Modal>
  )
}
