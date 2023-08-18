/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import { ModalLink, ModalLinks } from '../ModalLinks'
import { Button } from '../button/Button'
import { SideModal } from './SideModal'

// TODO: styling on modal mostly doesn't work
export function Default() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open menu</Button>
      <SideModal isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
        <SideModal.Body>
          <SideModal.Section>Section content</SideModal.Section>
          <SideModal.Section>
            <ModalLinks heading="Relevant docs">
              <ModalLink to="#" label="Subnetworks" />
              <ModalLink to="#" label="External IPs" />
            </ModalLinks>
          </SideModal.Section>{' '}
        </SideModal.Body>
        <SideModal.Footer>
          <Button>Ok</Button>
        </SideModal.Footer>
      </SideModal>
    </>
  )
}
