/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Dialog from '@radix-ui/react-dialog'
import { animated, useTransition } from '@react-spring/web'
import cn from 'classnames'
import React, { forwardRef, useId } from 'react'

import { Close12Icon } from '@oxide/design-system/icons/react'

import { classed } from '~/util/classed'

import { Button } from './Button'
import { DialogOverlay } from './DialogOverlay'
import { ModalContext } from './modal-context'

export type ModalProps = {
  title: string
  isOpen: boolean
  children?: React.ReactNode
  onDismiss: () => void
  /** Default false. Only needed in a couple of spots. */
  narrow?: true
  /** Default true. We only need to hide it for the rare case of modal on top of modal. */
  overlay?: boolean
}

// Note that the overlay has z-index 30 and content has 40. This is to make sure
// both land on top of a side modal in the regrettable case where we have both
// on screen at once.

export function Modal({
  children,
  onDismiss,
  title,
  isOpen,
  narrow,
  overlay = true,
}: ModalProps) {
  const titleId = useId()
  const AnimatedDialogContent = animated(Dialog.Content)

  const config = { tension: 650, mass: 0.125 }

  const transitions = useTransition(isOpen, {
    from: { y: -5 },
    enter: { y: 0 },
    config: isOpen ? config : { duration: 0 },
  })

  return (
    <ModalContext.Provider value>
      {transitions(
        ({ y }, item) =>
          item && (
            <Dialog.Root
              open
              onOpenChange={(open) => {
                if (!open) onDismiss()
              }}
              // https://github.com/radix-ui/primitives/issues/1159#issuecomment-1559813266
              modal={false}
            >
              <Dialog.Portal>
                {overlay && <DialogOverlay />}

                <AnimatedDialogContent
                  className={cn(
                    'pointer-events-auto fixed left-1/2 top-1/2 z-modal m-0 flex max-h-[min(800px,80vh)] w-full flex-col justify-between rounded-lg border p-0 bg-raise border-secondary elevation-2',
                    narrow ? 'max-w-[24rem]' : 'max-w-[28rem]'
                  )}
                  aria-labelledby={titleId}
                  style={{
                    transform: y.to((value) => `translate3d(-50%, ${-50 + value}%, 0px)`),
                  }}
                  // Prevents cancel loop on clicking on background over side
                  // modal to get out of image upload modal. Canceling out of
                  // confirm dialog returns focus to the dismissable layer,
                  // which triggers onDismiss again. And again.
                  // https://github.com/oxidecomputer/console/issues/1745
                  onFocusOutside={(e) => e.preventDefault()}
                >
                  <Dialog.Title asChild>
                    <ModalTitle id={titleId}>{title}</ModalTitle>
                  </Dialog.Title>
                  {children}
                  <Dialog.Close
                    className="absolute right-2 top-4 flex items-center justify-center rounded p-2 hover:bg-hover"
                    aria-label="Close"
                  >
                    <Close12Icon className="text-secondary" />
                  </Dialog.Close>
                </AnimatedDialogContent>
              </Dialog.Portal>
            </Dialog.Root>
          )
      )}
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
  formId,
}: {
  children?: React.ReactNode
  onDismiss: () => void
  onAction: () => void
  actionType?: 'primary' | 'danger'
  actionText: React.ReactNode
  actionLoading?: boolean
  cancelText?: string
  disabled?: boolean
  /**
   * If passed, submit button will get `type="submit"` and `form={formId}` so
   * that pressing enter in the associated form will be trigger a submit click.
   */
  formId?: string
}) => (
  <footer className="flex items-center justify-between border-t px-3 py-3 border-secondary">
    <div className="mr-4">{children}</div>
    <div className="space-x-2">
      <Button variant="secondary" size="sm" onClick={onDismiss}>
        {cancelText || 'Cancel'}
      </Button>
      <Button
        type={formId ? 'submit' : 'button'}
        form={formId}
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
