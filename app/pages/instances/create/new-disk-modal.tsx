import React from 'react'
import { Dialog } from '@reach/dialog'
import { Formik, Form } from 'formik'

import { Button, Icon, Radio, RadioGroup } from '@oxide/ui'

const headingStyle = 'font-medium mt-6 mb-3'

type Props = {
  isOpen: boolean
  onDismiss: () => void
}

export function NewDiskModal({ isOpen, onDismiss }: Props) {
  return (
    <Dialog
      className="SideModal"
      isOpen={isOpen}
      onDismiss={onDismiss}
      aria-labelledby="new-disk-modal-title"
    >
      <Formik initialValues={{ 'deletion-rule': '' }} onSubmit={() => {}}>
        <Form>
          <div className="modal-body">
            <div className="p-8">
              <div className="flex justify-between mt-2 mb-14">
                <h2 className="text-display-xl" id="new-disk-modal-title">
                  Add new disk
                </h2>
                <Button variant="link" onClick={onDismiss}>
                  <Icon name="close" />
                </Button>
              </div>
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
        </Form>
      </Formik>
    </Dialog>
  )
}
