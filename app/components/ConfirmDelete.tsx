import { useState } from 'react'

import { Message, Modal } from '@oxide/ui'

type ConfirmDeleteProps = {
  isOpen: boolean
  resourceName: string
  warning?: string
  onDismiss?: () => void
  onAction: () => void
}

const ConfirmDeleteModal = ({
  isOpen,
  resourceName,
  warning,
  onDismiss = () => {},
  onAction,
}: ConfirmDeleteProps) => (
  <Modal isOpen={isOpen} onDismiss={onDismiss} title="Confirm delete">
    <Modal.Section>
      <p>
        Are you sure you want to delete{' '}
        <span className="text-sans-semi-md text-default">{resourceName}</span>?
      </p>
      {warning && <Message variant="error" content={warning} />}
    </Modal.Section>
    <Modal.Footer
      onDismiss={onDismiss}
      onAction={onAction}
      cancelText="Cancel"
      actionText="Confirm"
      actionType="danger"
    />
  </Modal>
)

type ModalMessageProps = {
  resourceName: string
  warning?: string
}

export function useConfirmDeleteModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState<ModalMessageProps>()
  const [onConfirm, setOnConfirm] = useState<() => void>()

  const handleAction = () => {
    onConfirm && onConfirm()
    setIsOpen(false)
  }

  return {
    isOpen,
    shouldConfirmDelete: (fn: () => void, message: ModalMessageProps) => {
      setOnConfirm(() => fn) // ensure we're setting the function, not calling it
      setMessage(message)
      setIsOpen(true)
    },
    confirmDeleteModal: (
      <ConfirmDeleteModal
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        onAction={handleAction}
        resourceName={(message && message.resourceName) || ''}
        warning={message && message.warning ? message.warning : undefined}
      />
    ),
  }
}
