import { useState } from 'react'

import { Button } from '../button/Button'
import { FieldLabel } from '../field-label/FieldLabel'
import { TextInput, TextInputHint } from '../text-input/TextInput'
import { Modal } from './Modal'

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
      <Modal isOpen={isOpen} onDismiss={handleDismiss}>
        <Modal.Title>Title</Modal.Title>

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
        <Modal.Docs>
          {/* todo: should turn this into a component for consistency */}
          <a href="#/" className="text-tertiary">
            Subnetworks
          </a>
          <a href="#/" className="text-tertiary">
            External IPs
          </a>
        </Modal.Docs>
        <Modal.Footer
          onDismiss={handleDismiss}
          onAction={handleAction}
          actionText={'Save'}
        />
      </Modal>
    </>
  )
}
