import React from 'react'
import { Dialog } from '@reach/dialog'

import { Button, Icon, Dropdown } from '@oxide/ui'

const headingStyle = 'font-medium mt-6 mb-3'

type Props = {
  isOpen: boolean
  onDismiss: () => void
}

export function NetworkModal({ isOpen, onDismiss }: Props) {
  return (
    <Dialog
      className="SideModal"
      isOpen={isOpen}
      onDismiss={onDismiss}
      aria-labelledby="network-modal-title"
    >
      <div className="modal-body">
        <div className="p-8">
          <div className="flex justify-between mt-2 mb-14">
            <h2 className="text-display-xl" id="network-modal-title">
              Add network interface
            </h2>
            <Button variant="link" onClick={onDismiss}>
              <Icon name="close" />
            </Button>
          </div>
          <div className="space-y-6">
            {/* TODO: tearing up Dropdown into bits will let us fix button alignment */}
            <div className="flex">
              <Dropdown label="VPC" items={[]} className="flex-1 mr-2" />
              <Button>Create</Button>
            </div>
            <div className="flex">
              <Dropdown label="VPC subnet" items={[]} className="flex-1 mr-2" />
              <Button>Create</Button>
            </div>
            <Dropdown label="Primary internal IP" items={[]} />
            <Dropdown label="External IP" items={[]} />
            <Dropdown label="IP forwarding" items={[]} />
          </div>
        </div>
        <hr className="border-gray-400" />
        <div className="p-8">
          <h3 className={headingStyle}>Relevant docs</h3>
        </div>
      </div>
      <footer className="modal-footer">
        {/* TODO: not supposed to be a ghost button */}
        <Button variant="ghost" className="mr-2.5" onClick={onDismiss}>
          Cancel
        </Button>
        <Button>Add disk</Button>
      </footer>
    </Dialog>
  )
}
