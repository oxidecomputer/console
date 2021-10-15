import React from 'react'
import { Formik, Form } from 'formik'

import { Button, Radio, RadioGroup, SideModal } from '@oxide/ui'

const headingStyle = 'font-medium mt-6 mb-3'

type Props = {
  isOpen: boolean
  onDismiss: () => void
}

export function NewDiskModal({ isOpen, onDismiss }: Props) {
  return (
    <SideModal
      id="new-disk-modal"
      title="Add new disk"
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <SideModal.Section>
        <Formik initialValues={{ 'deletion-rule': '' }} onSubmit={() => {}}>
          <Form id="new-disk-form">
            <h3 className={headingStyle}>Name</h3>
            <h3 className={headingStyle}>Description</h3>
            <h3 className={headingStyle}>Type</h3>
            <h3 className={headingStyle}>Source type</h3>
            <fieldset>
              <legend className={headingStyle}>Deletion rule</legend>
              <RadioGroup name="deletion-rule" column>
                <Radio value="keep">Keep disk</Radio>
                <Radio value="delete">Delete disk</Radio>
              </RadioGroup>
            </fieldset>
            <h3 className={headingStyle}>Size (GiB)</h3>
            <h3 className={headingStyle}>Configuration options</h3>
          </Form>
        </Formik>
      </SideModal.Section>
      <SideModal.Docs>
        <a href="#/">Formatting a persistent disk</a>
        <a href="#/">Deletion Rules</a>
        <a href="#/">Disk naming</a>
      </SideModal.Docs>
      <SideModal.Footer>
        {/* TODO: not supposed to be a ghost button */}
        <Button variant="ghost" className="mr-2.5" onClick={onDismiss}>
          Cancel
        </Button>
        <Button form="new-disk-form">Add disk</Button>
      </SideModal.Footer>
    </SideModal>
  )
}
