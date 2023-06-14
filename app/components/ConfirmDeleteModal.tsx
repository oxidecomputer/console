import { Message, Modal } from '@oxide/ui'

import { clearConfirmDelete, useConfirmDelete } from 'app/stores/confirm-delete'
import { addToast } from 'app/stores/toast'

const errorToast = () =>
  addToast({
    variant: 'error',
    title: 'Could not delete resource',
    content: 'Please try again',
  })

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
        onAction={async () => {
          await doDelete().catch(errorToast)
          clearConfirmDelete()
        }}
        cancelText="Cancel"
        actionText="Confirm"
        actionType="danger"
      />
    </Modal>
  )
}
