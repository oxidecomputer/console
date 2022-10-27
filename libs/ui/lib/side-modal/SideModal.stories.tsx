import { useState } from 'react'

import { Button } from '../button/Button'
import { SideModal } from './SideModal'

// TODO: styling on modal mostly doesn't work
export function Default() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open menu</Button>
      <SideModal isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
        <SideModal.Section>Section content</SideModal.Section>
        <SideModal.Docs>
          <a href="#/">Subnetworks</a>
          <a href="#/">External IPs</a>
        </SideModal.Docs>
        <SideModal.Footer>
          <Button>Ok</Button>
        </SideModal.Footer>
      </SideModal>
    </>
  )
}
