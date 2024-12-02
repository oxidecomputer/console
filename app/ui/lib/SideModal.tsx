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
import React, { useRef, type ReactNode } from 'react'

import { Close12Icon, Error12Icon } from '@oxide/design-system/icons/react'

import { useIsOverflow } from '~/hooks/use-is-overflow'
import { Message } from '~/ui/lib/Message'
import { classed } from '~/util/classed'

import { DialogOverlay } from './DialogOverlay'
import { SideModalContext, useIsInModal, useIsInSideModal } from './modal-context'

export function usePopoverZIndex() {
  const isInModal = useIsInModal()
  const isInSideModal = useIsInSideModal()
  return isInModal
    ? 'z-modalDropdown'
    : isInSideModal
      ? 'z-sideModalDropdown'
      : 'z-contentDropdown'
}

export type SideModalProps = {
  title: string
  subtitle?: ReactNode
  onDismiss: () => void
  isOpen: boolean
  children?: React.ReactNode
  errors?: string[]
  /**
   * Whether the modal should animate in. It never animates out. Default `true`.
   * Used to prevent animation from firing when we show the modal directly on a
   * fresh pageload.
   */
  animate?: boolean
}

export function SideModal({
  children,
  onDismiss,
  title,
  subtitle,
  isOpen,
  animate = true,
  errors,
}: SideModalProps) {
  const AnimatedDialogContent = animated(Dialog.Content)

  const config = { tension: 650, mass: 0.125 }

  const transitions = useTransition(isOpen, {
    from: { x: 50 },
    enter: { x: 0 },
    config: isOpen && animate ? config : { duration: 0 },
  })

  return (
    <SideModalContext.Provider value>
      {transitions(
        ({ x }, item) =>
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
                <DialogOverlay />
                <AnimatedDialogContent
                  className="DialogContent ox-side-modal pointer-events-auto fixed bottom-0 right-0 top-0 z-sideModal m-0 flex w-[32rem] flex-col justify-between border-l p-0 bg-raise border-secondary elevation-2"
                  style={{
                    transform: x.to((value) => `translate3d(${value}%, 0px, 0px)`),
                  }}
                  // shuts off a warning from radix about dialog content needing a description
                  aria-describedby={undefined}
                >
                  <div className="items-top mb-4 mt-8">
                    <Dialog.Title className="flex w-full items-center justify-between break-words pr-8 text-sans-2xl text-raise">
                      {title}
                    </Dialog.Title>
                    {subtitle}
                  </div>
                  {errors && errors.length > 0 && (
                    <div className="mb-6">
                      <Message
                        variant="error"
                        content={
                          errors.length === 1 ? (
                            errors[0]
                          ) : (
                            <>
                              <div>{errors.length} issues:</div>
                              <ul className="ml-4 list-disc">
                                {errors.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                              </ul>
                            </>
                          )
                        }
                        title={errors.length > 1 ? 'Errors' : 'Error'}
                      />
                    </div>
                  )}
                  {children}
                </AnimatedDialogContent>
              </Dialog.Portal>
            </Dialog.Root>
          )
      )}
    </SideModalContext.Provider>
  )
}

export const ResourceLabel = classed.h3`mt-2 flex items-center gap-1.5 text-sans-md text-accent`

// separate component because otherwise eslint thinks it's not a component and
// gets mad about the use of hooks
function SideModalBody({ children }: { children?: ReactNode }) {
  const overflowRef = useRef<HTMLDivElement>(null)
  const { scrollStart } = useIsOverflow(overflowRef, 'vertical')

  return (
    <div
      ref={overflowRef}
      className={cn(
        'body relative h-full overflow-y-auto pb-12 pt-8',
        !scrollStart && 'border-t border-t-secondary'
      )}
      data-testid="sidemodal-scroll-container"
    >
      {children}
    </div>
  )
}

SideModal.Body = SideModalBody

SideModal.Heading = classed.div`text-sans-semi-xl`

SideModal.Section = classed.div`p-8 space-y-6 border-secondary`

SideModal.Footer = ({ children, error }: { children: ReactNode; error?: boolean }) => (
  <footer className="flex w-full items-center justify-end gap-[0.625rem] border-t py-5 border-secondary children:shrink-0">
    {error && (
      <div className="flex grow items-center gap-1.5 text-sans-md text-error">
        <Error12Icon className="shrink-0" />
        <span>Error</span>
      </div>
    )}
    {children}
    {/*
      Close button is here at the end so we aren't automatically focusing on it
      when the side modal is opened. Positioned in the safe area at the top
     */}
    <Dialog.Close
      className="absolute right-[var(--content-gutter)] top-10 -m-2 flex rounded p-2 hover:bg-hover"
      aria-label="Close"
    >
      <Close12Icon className="text-default" />
    </Dialog.Close>
  </footer>
)
