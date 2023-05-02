import * as Dialog from '@radix-ui/react-dialog'
import { animated, useTransition } from '@react-spring/web'
import React, { createContext, useContext } from 'react'

import { classed } from '@oxide/util'

import { Button } from '../button/Button'
import { Close12Icon, OpenLink12Icon } from '../icons'

const ModalContext = createContext(false)

export const useIsInModal = () => {
  return useContext(ModalContext)
}

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
  const titleId = 'modal-title'
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
            >
              <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay !z-30" />
                <AnimatedDialogContent
                  className="DialogContent ox-modal fixed left-1/2 top-1/2 z-40 m-0 flex max-h-[min(800px,80vh)] w-[32rem] flex-col justify-between rounded-lg border p-0 bg-raise border-secondary elevation-2"
                  aria-labelledby={titleId}
                  style={{
                    transform: y.to((value) => `translate3d(-50%, ${-50 + value}%, 0px)`),
                  }}
                >
                  {title && (
                    <Dialog.Title asChild>
                      <Modal.Title>{title}</Modal.Title>
                    </Dialog.Title>
                  )}
                  {children}
                </AnimatedDialogContent>
              </Dialog.Portal>
            </Dialog.Root>
          )
      )}
    </ModalContext.Provider>
  )
}

Modal.Title = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex items-center justify-between border-b py-4 px-4 bg-secondary border-b-secondary">
    <h2 className="text-sans-semi-lg">{children}</h2>
    <Dialog.Close className="-m-2 flex rounded p-2 hover:bg-secondary-hover">
      <Close12Icon />
    </Dialog.Close>
  </div>
)

Modal.Body = classed.div`py-2 overflow-y-auto`

Modal.Section = classed.div`p-4 space-y-6 border-b border-secondary text-secondary last-of-type:border-none text-sans-md`

Modal.Docs = ({ children }: { children?: React.ReactNode }) => (
  <Modal.Section>
    <div>
      <h3 className="mb-2 text-sans-semi-md">Relevant docs</h3>
      <ul className="space-y-0.5 text-sans-md text-secondary">
        {React.Children.map(children, (child) => (
          <li className="flex items-center space-x-2">
            <OpenLink12Icon className="mt-0.5 text-accent" />
            {child}
          </li>
        ))}
      </ul>
    </div>
  </Modal.Section>
)

Modal.Footer = ({
  children,
  onDismiss,
  onAction,
  actionType = 'primary',
  actionText,
}: {
  children?: React.ReactNode
  onDismiss: () => void
  onAction: () => void
  actionType?: 'primary' | 'danger'
  actionText: React.ReactNode
}) => (
  <footer className="flex justify-end border-t px-3 py-3 border-secondary">
    <div>{children}</div>
    <div className="space-x-2">
      <Button variant="secondary" size="sm" onClick={onDismiss}>
        Cancel
      </Button>
      <Button size="sm" variant={actionType} onClick={onAction}>
        {actionText}
      </Button>
    </div>
  </footer>
)
