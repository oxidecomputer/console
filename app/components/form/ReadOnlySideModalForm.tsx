/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'

import { useShouldAnimateModal } from '~/hooks/use-should-animate-modal'
import { Button } from '~/ui/lib/Button'
import { SideModal } from '~/ui/lib/SideModal'

type ReadOnlySideModalFormProps = {
  title: string
  subtitle?: ReactNode
  onDismiss: () => void
  children: ReactNode
  /** Pass `true` for state-driven modals. Omit for route-driven modals to use nav type. */
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
  const animateDefault = useShouldAnimateModal()
  return (
    <SideModal
      isOpen
      onDismiss={onDismiss}
      title={title}
      subtitle={subtitle}
      animate={animate ?? animateDefault}
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
