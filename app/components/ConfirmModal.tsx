/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import * as m from 'motion/react-m'
import { useRef, type ReactNode } from 'react'

import { Close12Icon } from '@oxide/design-system/icons/react'

import { Modal } from '~/ui/lib/Modal'
import { ModalContext, useSideModalPopupRef } from '~/ui/lib/modal-context'

type ConfirmModalProps = {
  isOpen: boolean
  onDismiss: () => void
  onConfirm: () => void
  /** Short question, sentence case. e.g. "Cancel upload?" */
  title: string
  /** One or two short lines. State the consequence first. */
  children: ReactNode
  /** Verb phrase matching the destructive action. e.g. "Cancel upload" */
  confirmText: string
  /** Verb phrase meaning "stay where I am". e.g. "Keep uploading" */
  dismissText: string
  /** @default 'danger' */
  actionType?: 'primary' | 'danger'
}

/**
 * A confirm dialog stacked over a SideModal (e.g. a nav guard on an edited
 * form, or a cancel guard on an in-flight upload). Portals into the
 * SideModal's popup rather than document body, so the scrim and dialog use
 * the SideModal as their positioning context — auto-centered, no hard-coded
 * widths.
 *
 * On open, focus lands on the destructive primary action so a user who got
 * here by triggering a dismiss can press Enter once more to confirm. Esc and
 * the × close only this dialog, leaving the SideModal open.
 *
 * Must be rendered inside a SideModal — relies on SideModalPopupRefContext.
 */
export function ConfirmModal({
  isOpen,
  onDismiss,
  onConfirm,
  title,
  children,
  confirmText,
  dismissText,
  actionType = 'danger',
}: ConfirmModalProps) {
  const actionRef = useRef<HTMLButtonElement>(null)
  const sideModalRef = useSideModalPopupRef()
  if (!isOpen || !sideModalRef) return null
  return (
    <ModalContext.Provider value>
      <BaseDialog.Root
        open
        onOpenChange={(open, { reason }) => {
          // Ignore focus-out to prevent a dismiss loop when a native confirm()
          // dialog steals and returns focus. Same trick as Modal.
          if (!open && reason !== 'focus-out') onDismiss()
        }}
      >
        {/* Portal into the SideModal so absolute children use the SideModal
            as their positioning context — no hard-coded widths. */}
        <BaseDialog.Portal container={sideModalRef}>
          {/* Scrim. absolute inset-0 fills the SideModal's popup, not the
            viewport. forceRender so base-ui doesn't hide the nested backdrop. */}
          <BaseDialog.Backdrop
            forceRender
            render={
              <m.div
                className="bg-raise/80 absolute inset-0 z-10 -mx-(--gutter)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              />
            }
          />
          <BaseDialog.Popup
            initialFocus={actionRef}
            render={
              <m.div
                initial={{ x: '-50%', y: 'calc(-50% - 16px)', opacity: 0 }}
                animate={{ x: '-50%', y: '-50%', opacity: 1 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                className="bg-default light:bg-default shadow-modal pointer-events-auto absolute top-1/2 left-1/2 z-20 flex max-h-[calc(100%-2rem)] w-full max-w-md -translate-y-1/2 flex-col overflow-hidden rounded-lg"
              />
            }
          >
            <Modal.Section>
              <BaseDialog.Title className="text-sans-semi-lg mb-2">
                {title}
              </BaseDialog.Title>
              {children}
            </Modal.Section>
            <Modal.Footer
              onDismiss={onDismiss}
              onAction={onConfirm}
              cancelText={dismissText}
              actionText={confirmText}
              actionType={actionType}
              actionRef={actionRef}
            />
            <BaseDialog.Close
              className="hover:bg-hover absolute top-2 right-2 flex items-center justify-center rounded-md p-2"
              aria-label="Close"
            >
              <Close12Icon className="text-default" />
            </BaseDialog.Close>
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>
    </ModalContext.Provider>
  )
}
