import React from 'react'

import { Button, Dropdown, SideModal_old as SideModal } from '@oxide/ui'
import { useApiQuery } from '@oxide/api'

type Props = {
  isOpen: boolean
  onDismiss: () => void
  orgName: string
  projectName: string
}

export function NetworkModal({
  isOpen,
  onDismiss,
  orgName,
  projectName,
}: Props) {
  const { data: vpcs } = useApiQuery('projectVpcsGet', { orgName, projectName })
  const vpcItems = vpcs?.items.map((v) => ({ value: v.id, label: v.name }))
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
          <Dropdown
            label="VPC"
            items={vpcItems || []}
            className="mr-2 flex-1"
          />
          <Button>Create</Button>
        </div>
        <div className="flex items-end">
          <Dropdown label="VPC subnet" items={[]} className="mr-2 flex-1" />
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
