/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'

import { Button } from '~/ui/lib/Button'
import { SideModal } from '~/ui/lib/SideModal'

type ReadOnlySideModalFormProps = {
  title: string
  subtitle?: ReactNode
  onDismiss: () => void
  children: ReactNode
  /**
   * Whether to animate the modal opening. Defaults to true. Used to prevent
   * modal from animating in on a fresh pageload where it should already be
   * open.
   */
  animate?: boolean
}

/**
 * A read-only side modal that displays form fields in a non-editable state.
 * Use this for "view" or "detail" modals where fields are shown but not editable.
 */
export function ReadOnlySideModalForm({
  title,
  subtitle,
  onDismiss,
  children,
  animate,
}: ReadOnlySideModalFormProps) {
  return (
    <SideModal
      isOpen
      onDismiss={onDismiss}
      title={title}
      subtitle={subtitle}
      animate={animate}
    >
      <SideModal.Body>
        <div className="ox-form">{children}</div>
      </SideModal.Body>
      <SideModal.Footer>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Close
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
