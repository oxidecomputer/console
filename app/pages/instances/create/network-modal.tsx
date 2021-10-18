import React from 'react'

import { Button, Dropdown, SideModal } from '@oxide/ui'

type Props = {
  isOpen: boolean
  onDismiss: () => void
}

export function NetworkModal({ isOpen, onDismiss }: Props) {
  return (
    <SideModal
      id="network-modal"
      title="Add network interface"
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <SideModal.Section>
        {/* TODO: tearing up Dropdown into bits will let us fix button alignment */}
        <div className="flex items-end">
          <Dropdown label="VPC" items={[]} className="flex-1 mr-2" />
          <Button>Create</Button>
        </div>
        <div className="flex items-end">
          <Dropdown label="VPC subnet" items={[]} className="flex-1 mr-2" />
          <Button>Create</Button>
        </div>
        <Dropdown label="Primary internal IP" items={[]} />
        <Dropdown label="External IP" items={[]} />
        <Dropdown label="IP forwarding" items={[]} />
      </SideModal.Section>
      <SideModal.Docs>
        <a href="#/">Subnetworks</a>
        <a href="#/">External IPs</a>
      </SideModal.Docs>
      <SideModal.Footer>
        {/* TODO: not supposed to be a ghost button */}
        <Button variant="ghost" className="mr-2.5" onClick={onDismiss}>
          Cancel
        </Button>
        <Button>Add disk</Button>
      </SideModal.Footer>
    </SideModal>
  )
}
