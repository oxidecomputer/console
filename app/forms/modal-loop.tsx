import { useState } from 'react'

import { Button, Modal, SideModal } from '@oxide/ui'

export function ModalLoopSideModal() {
  const [modalOpen, setModalOpen] = useState(false)
  function closeModal() {
    if (confirm('close?')) {
      setModalOpen(false)
    }
  }
  return (
    <SideModal isOpen onDismiss={() => {}} title="Modal loop test">
      <SideModal.Body>
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        {modalOpen && (
          <Modal isOpen onDismiss={closeModal} title="A seres of unfortunate events">
            <Modal.Body>No</Modal.Body>
            <Modal.Footer
              onDismiss={closeModal}
              onAction={() => {}}
              actionText="Done"
              cancelText="Cancel"
            />
          </Modal>
        )}
      </SideModal.Body>
    </SideModal>
  )
}
