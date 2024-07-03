/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Blocker } from 'react-router-dom'

import { Modal } from '~/ui/lib/Modal'

export const ConfirmNavigation = ({ blocker }: { blocker: Blocker }) => (
  <Modal
    isOpen={blocker.state === 'blocked'}
    onDismiss={() => blocker.reset?.()}
    title="Confirm navigation"
  >
    <Modal.Section>
      Are you sure you want to leave this page? <br /> You will lose all progress on this
      form.
    </Modal.Section>
    <Modal.Footer
      onDismiss={() => blocker.reset?.()}
      onAction={() => blocker.proceed?.()}
      cancelText="Continue editing"
      actionText="Leave this page"
      actionType="danger"
    />
  </Modal>
)
