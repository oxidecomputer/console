import React, { useState } from 'react'
import { useParams } from 'react-router'
import { Dialog } from '@reach/dialog'

import type { Disk } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button, Dropdown, Icon, Radio, RadioGroup } from '@oxide/ui'

const headingStyle = 'font-medium mt-6 mb-3'

type Props = {
  isOpen: boolean
  onDismiss: () => void
}

type DeletionRule = 'keep' | 'delete'
type Mode = 'read-write' | 'read-only'

const isUnattached = ({ state }: Disk) => {
  // HACK: the DiskState types are all messed up, so here we work around that
  // by casting the state to a string, which we know it is
  const stateStr = state.state as string
  return (
    stateStr !== 'attached' &&
    stateStr !== 'attaching' &&
    stateStr !== 'detaching'
  )
}

export function ExistingDiskModal({ isOpen, onDismiss }: Props) {
  const { projectName } = useParams()
  const { data } = useApiQuery('projectDisksGet', { projectName })
  const disks = (data?.items || [])
    .filter(isUnattached)
    .map((d) => ({ value: d.id, label: d.name }))

  const [deletionRule, setDeletionRule] = useState<DeletionRule>('keep')
  const [mode, setMode] = useState<Mode>('read-write')
  return (
    <Dialog
      className="SideModal"
      isOpen={isOpen}
      onDismiss={onDismiss}
      aria-labelledby="existing-disk-modal-title"
    >
      <div className="modal-body">
        <div className="p-8">
          <div className="flex justify-between mt-2 mb-14">
            <h2 className="text-display-xl" id="existing-disk-modal-title">
              Add existing disk
            </h2>
            <Button variant="link" onClick={onDismiss}>
              <Icon name="close" />
            </Button>
          </div>
          {/* <h3 className={headingStyle}>Disk</h3> */}
          <Dropdown label="Disk" placeholder="Choose a disk..." items={disks} />
          <fieldset>
            <legend className={headingStyle}>Mode</legend>
            <RadioGroup
              value={mode}
              name="mode"
              onChange={(e) => setMode(e.target.value as Mode)}
              column
            >
              <Radio value="read-write">Read/Write</Radio>
              <Radio value="read-only">Read only</Radio>
            </RadioGroup>
          </fieldset>
          <fieldset>
            <legend className={headingStyle}>Deletion rule</legend>
            <RadioGroup
              value={deletionRule}
              name="deletion-rule"
              onChange={(e) => setDeletionRule(e.target.value as DeletionRule)}
              column
            >
              <Radio value="keep">Keep disk</Radio>
              <Radio value="delete">Delete disk</Radio>
            </RadioGroup>
          </fieldset>
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
