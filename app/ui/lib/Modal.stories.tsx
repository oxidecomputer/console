/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import { Button } from './Button'
import { FieldLabel } from './FieldLabel'
import { Modal } from './Modal'
import { ModalLink, ModalLinks } from './ModalLinks'
import { TextInput, TextInputHint } from './TextInput'

export function Default() {
  const [isOpen, setIsOpen] = useState(false)

  function handleDismiss() {
    setIsOpen(false)
  }

  function handleAction() {
    console.log('action')
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open menu</Button>
      <Modal isOpen={isOpen} onDismiss={handleDismiss} title="Title">
        <Modal.Body>
          <Modal.Section>
            <p>
              Copy your public SSH key and paste it in the space below. For instructions on
              how, follow the steps on the right.
            </p>

            <div>
              <FieldLabel id="label" optional={false}>
                SSH key content
              </FieldLabel>
              <TextInputHint id="help-text" className="mb-2">
                Begins with &apos;ssh-rsa&apos;, &apos;ssh-ed25519&apos;,
                &apos;ecdsa-sha2-nistp256&apos;, &apos;ecdsa-sha2-nistp384&apos;, or
                &apos;ecdsa-sha2-nistp521&apos;
              </TextInputHint>
              <TextInput as="textarea" rows={5} placeholder="Enter your SSH key" />
            </div>
          </Modal.Section>
          <Modal.Section>
            <ModalLinks heading="Relevant docs">
              <ModalLink to="#" label="Subnetworks" />
              <ModalLink to="#" label="External IPs" />
            </ModalLinks>
          </Modal.Section>
        </Modal.Body>

        <Modal.Footer
          onDismiss={handleDismiss}
          onAction={handleAction}
          actionText={'Save'}
        />
      </Modal>
    </>
  )
}

export function Sticky() {
  const [isOpen, setIsOpen] = useState(false)

  function handleDismiss() {
    setIsOpen(false)
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open menu</Button>
      <Modal isOpen={isOpen} onDismiss={handleDismiss} title="Title">
        <Modal.Body>
          <Modal.Section>
            <div className="space-y-2">
              {[...Array(200)].map((_e, i) => (
                <div key={i}>This is some text</div>
              ))}
            </div>
          </Modal.Section>
        </Modal.Body>

        <Modal.Footer onDismiss={handleDismiss} onAction={() => {}} actionText="Save" />
      </Modal>
    </>
  )
}
