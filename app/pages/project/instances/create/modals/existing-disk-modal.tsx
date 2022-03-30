import React from 'react'
import { Formik, Form } from 'formik'

import type { Disk } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import {
  Button,
  Dropdown,
  FieldLabel,
  Radio,
  RadioGroup,
  SideModal_old as SideModal,
} from '@oxide/ui'

type Props = {
  isOpen: boolean
  onDismiss: () => void
  orgName: string
  projectName: string
}

const isUnattached = ({ state }: Disk) => {
  const stateStr = state.state
  return (
    stateStr !== 'attached' &&
    stateStr !== 'attaching' &&
    stateStr !== 'detaching'
  )
}

export function ExistingDiskModal({
  isOpen,
  onDismiss,
  orgName,
  projectName,
}: Props) {
  // TODO: maybe wait to fetch until you open the modal
  const { data } = useApiQuery('projectDisksGet', { orgName, projectName })

  const disks = data?.items
    .filter(isUnattached)
    .map((d) => ({ value: d.id, label: d.name }))

  return (
    <SideModal
      id="existing-disk-modal"
      title="Add existing disk"
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <SideModal.Section>
        <Formik
          initialValues={{ mode: '', 'deletion-rule': '' }}
          onSubmit={() => {}}
        >
          <Form
            id="add-existing-disk-form"
            className="space-y-6 children:space-y-0.5"
          >
            {/* <h3 className={headingStyle}>Disk</h3> */}
            <Dropdown
              label="Disk"
              placeholder="Choose a disk..."
              items={disks || []}
            />
            <fieldset>
              <FieldLabel as="legend">Mode</FieldLabel>
              <RadioGroup name="mode" column>
                <Radio value="read-write">Read/Write</Radio>
                <Radio value="read-only">Read only</Radio>
              </RadioGroup>
            </fieldset>
            <fieldset>
              <FieldLabel as="legend">Deletion Rule</FieldLabel>
              <RadioGroup name="deletion-rule" column>
                <Radio value="keep">Keep disk</Radio>
                <Radio value="delete">Delete disk</Radio>
              </RadioGroup>
            </fieldset>
          </Form>
        </Formik>
      </SideModal.Section>
      <SideModal.Docs>
        <a href="#/">Deletion rules</a>
        <a href="#/">Disk naming</a>
      </SideModal.Docs>
      <SideModal.Footer>
        {/* TODO: not supposed to be a ghost button */}
        <Button
          form="add-existing-disk-form"
          variant="ghost"
          className="mr-2.5"
          onClick={onDismiss}
        >
          Cancel
        </Button>
        <Button>Add disk</Button>
      </SideModal.Footer>
    </SideModal>
  )
}
