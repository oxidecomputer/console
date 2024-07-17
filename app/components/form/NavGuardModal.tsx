/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Modal } from '~/ui/lib/Modal'

const NavGuardModal = ({
  onAction,
  onDismiss,
}: {
  onAction: () => void
  onDismiss: () => void
}) => (
  <Modal isOpen onDismiss={onDismiss} title="Confirm navigation">
    <Modal.Section>
      Are you sure you want to leave this form? Your progress will be lost.
    </Modal.Section>
    <Modal.Footer
      onAction={onAction}
      onDismiss={onDismiss}
      cancelText="Keep editing"
      actionText="Leave form"
      actionType="danger"
    />
  </Modal>
)

export { NavGuardModal }
