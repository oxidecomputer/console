import React from 'react'
import { Formik, Form } from 'formik'

import {
  Button,
  FieldTitle,
  Radio,
  RadioGroup,
  SideModal,
  TextField,
} from '@oxide/ui'

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
            <div>
              <FieldTitle htmlFor="new-disk-name" tip="The name of the disk">
                Name
              </FieldTitle>
              <TextField id="new-disk-name" />
            </div>
            <div>
              <FieldTitle
                htmlFor="new-disk-description"
                tip="A message to be stored about the disk"
              >
                Description
              </FieldTitle>
              <TextField id="new-disk-description" />
            </div>
            <div>
              <FieldTitle htmlFor="new-disk-description">Type</FieldTitle>
              <TextField id="new-disk-description" />
            </div>
            <div>
              <FieldTitle htmlFor="new-disk-description">
                Source type
              </FieldTitle>
              <TextField id="new-disk-description" />
            </div>
            <fieldset>
              <FieldTitle as="legend">Deletion rule</FieldTitle>
              <RadioGroup name="deletion-rule" column>
                <Radio value="keep">Keep disk</Radio>
                <Radio value="delete">Delete disk</Radio>
              </RadioGroup>
            </fieldset>
            <div>
              <FieldTitle htmlFor="new-disk-size">Size (GiB)</FieldTitle>
              <TextField id="new-disk-size" />
            </div>
            <fieldset>
              <FieldTitle as="legend">Configuration options</FieldTitle>
              <RadioGroup name="configuration-options" column>
                <Radio value="manual-mount">Manually format and mount</Radio>
                <Radio value="auto-mount">Automatically format and mount</Radio>
              </RadioGroup>
            </fieldset>
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
