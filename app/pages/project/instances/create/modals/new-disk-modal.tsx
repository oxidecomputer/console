import React from 'react'
import { Formik, Form } from 'formik'

import {
  Button,
  FieldLabel,
  Radio,
  RadioGroup,
  SideModal_old as SideModal,
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
        <Formik
          initialValues={{
            name: '',
            description: '',
            size: '',
            type: '',
            'source-type': '',
            'deletion-rule': '',
          }}
          onSubmit={() => {}}
        >
          <Form id="new-disk-form" className="space-y-6 children:space-y-0.5">
            <div>
              <FieldLabel htmlFor="new-disk-name" tip="The name of the disk">
                Name
              </FieldLabel>
              <TextField id="new-disk-name" name="name" />
            </div>
            <div>
              <FieldLabel
                htmlFor="new-disk-description"
                tip="A message to be stored about the disk"
              >
                Description
              </FieldLabel>
              <TextField id="new-disk-description" name="description" />
            </div>
            <div>
              <FieldLabel htmlFor="new-disk-type">Type</FieldLabel>
              <TextField id="new-disk-type" name="type" />
            </div>
            <div>
              <FieldLabel htmlFor="new-disk-source-type">
                Source type
              </FieldLabel>
              <TextField id="new-disk-source-type" name="source-type" />
            </div>
            <fieldset>
              <FieldLabel as="legend">Deletion rule</FieldLabel>
              <RadioGroup name="deletion-rule" column>
                <Radio value="keep">Keep disk</Radio>
                <Radio value="delete">Delete disk</Radio>
              </RadioGroup>
            </fieldset>
            <div>
              <FieldLabel htmlFor="new-disk-size">Size (GiB)</FieldLabel>
              <TextField id="new-disk-size" name="size" />
            </div>
            <fieldset>
              <FieldLabel as="legend">Configuration options</FieldLabel>
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
