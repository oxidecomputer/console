/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Dialog from '@radix-ui/react-dialog'
import { m } from 'framer-motion'
import React, { createContext, forwardRef, useContext, useId } from 'react'

import { Close12Icon } from '@oxide/design-system/icons/react'

import { classed } from '~/util/classed'

import { Button } from './Button'
import { DialogOverlay } from './DialogOverlay'

const ModalContext = createContext(false)

export const useIsInModal = () => useContext(ModalContext)

export type ModalProps = {
  title?: string
  isOpen: boolean
  children?: React.ReactNode
  onDismiss: () => void
}

// Note that the overlay has z-index 30 and content has 40. This is to make sure
// both land on top of a side modal in the regrettable case where we have both
// on screen at once.

export function Modal({ children, onDismiss, title, isOpen }: ModalProps) {
  const titleId = useId()

  return (
    <ModalContext.Provider value>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onDismiss()
        }}
        modal={false}
      >
        <Dialog.Portal>
          <DialogOverlay />

          <Dialog.Content asChild>
            <m.div
              initial={{ x: '-50%', y: 'calc(-50% - 25px)' }}
              animate={{ x: '-50%', y: '-50%' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
              className="pointer-events-auto fixed left-1/2 top-1/2 z-modal m-0 flex max-h-[min(800px,80vh)] w-auto min-w-[28rem] max-w-[32rem] -translate-x-1/2 -translate-x-1/2 -translate-y-1/2 -translate-y-1/2 flex-col justify-between rounded-lg border p-0 bg-raise border-secondary elevation-2"
              aria-labelledby={titleId}
            >
              {title && (
                <Dialog.Title asChild>
                  <ModalTitle id={titleId}>{title}</ModalTitle>
                </Dialog.Title>
              )}
              {children}
              <Dialog.Close
                className="absolute right-2 top-3 flex rounded p-2 hover:bg-hover"
                aria-label="Close"
              >
                <Close12Icon className="text-secondary" />
              </Dialog.Close>
            </m.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ModalContext.Provider>
  )
}

interface ModalTitleProps {
  children?: React.ReactNode
  id?: string
}

// not exported because we want to use the `title` prop on Modal so the aria
// label gets hooked up properly
const ModalTitle = forwardRef<HTMLDivElement, ModalTitleProps>(({ children, id }, ref) => (
  <div
    ref={ref}
    className="flex items-center justify-between border-b px-4 py-4 bg-secondary border-b-secondary"
  >
    <h2 className="text-sans-semi-lg" id={id}>
      {children}
    </h2>
  </div>
))

Modal.Body = classed.div`py-2 overflow-y-auto`

Modal.Section = classed.div`p-4 space-y-4 border-b border-secondary text-secondary last-of-type:border-none text-sans-md`

Modal.Footer = ({
  children,
  onDismiss,
  onAction,
  actionType = 'primary',
  actionText,
  actionLoading,
  cancelText,
  disabled = false,
}: {
  children?: React.ReactNode
  onDismiss: () => void
  onAction: () => void
  actionType?: 'primary' | 'danger'
  actionText: React.ReactNode
  actionLoading?: boolean
  cancelText?: string
  disabled?: boolean
}) => (
  <footer className="flex items-center justify-between border-t px-3 py-3 border-secondary">
    <div className="mr-4">{children}</div>
    <div className="space-x-2">
      <Button variant="secondary" size="sm" onClick={onDismiss}>
        {cancelText || 'Cancel'}
      </Button>
      <Button
        size="sm"
        variant={actionType}
        onClick={onAction}
        disabled={disabled}
        loading={actionLoading}
      >
        {actionText}
      </Button>
    </div>
  </footer>
)
