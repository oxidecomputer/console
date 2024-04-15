/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { navToLogin } from '~/api/nav-to-login'
import { clearSessionExpired, useSessionExpiredStore } from '~/stores/session-expired'
import { Modal } from '~/ui/lib/Modal'

// TODO: make sure this deals with other modals properly. when I tested it on
// the project create form, that form modal closed when this one opened, even
// if I remove the return in the error handler to make sure the error still gets
// thrown. I don't understand why this happens. It's possible there can only be
// one dialog open at a time? If that's the case, then presumably the last to
// open wins. That's not the worst, but it's really pretty crappy because you
// can't see what you were doing.

// ah. I think it's the focus on the new modal that triggers onDismiss on the
// old because it's a focus outside. found that by putting conosle.trace inside
// the project create onDismiss

export function SessionExpiredModal() {
  const expired = useSessionExpiredStore()
  if (!expired) return null

  return (
    <Modal
      title="Session expired"
      isOpen
      // TODO: can we dismiss this? I guess you might want to look at the page again? hm
      onDismiss={clearSessionExpired}
    >
      <Modal.Body>
        {/* TODO: copy, obviously*/}
        <Modal.Section>You session has expired</Modal.Section>
      </Modal.Body>
      {/* TODO: probably want custom footer, extract container div */}
      <Modal.Footer
        onDismiss={clearSessionExpired}
        // don't need to set session expired to false again because this is a full page nav
        onAction={() => navToLogin({ includeCurrent: true })}
        actionText="Go to login"
        actionType="danger"
      />
    </Modal>
  )
}
