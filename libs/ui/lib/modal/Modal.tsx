import * as Dialog from '@radix-ui/react-dialog'
import { animated, useTransition } from '@react-spring/web'
import React, { createContext, forwardRef, useContext, useId } from 'react'

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
                <div
                  className="DialogOverlay pointer-events-auto"
                  onClick={onDismiss}
                  aria-hidden
                />
                <AnimatedDialogContent
                  className="DialogContent ox-modal pointer-events-auto fixed left-1/2 top-1/2 z-40 m-0 flex max-h-[min(800px,80vh)] w-auto min-w-[28rem] max-w-[32rem] flex-col justify-between rounded-lg border p-0 bg-raise border-secondary elevation-2"
                  aria-labelledby={titleId}
                  style={{
                    transform: y.to((value) => `translate3d(-50%, ${-50 + value}%, 0px)`),
                  }}
                >
                  {title && (
                    <Dialog.Title asChild>
                      <ModalTitle id={titleId}>{title}</ModalTitle>
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

interface ModalTitleProps {
  children?: React.ReactNode
  id?: string
}

// not exported because we want to use the `title` prop on Modal so the aria
// label gets hooked up properly
const ModalTitle = forwardRef<HTMLDivElement, ModalTitleProps>(({ children, id }, ref) => (
  <div
    ref={ref}
    className="flex items-center justify-between border-b py-4 px-4 bg-secondary border-b-secondary"
  >
    <h2 className="text-sans-semi-lg" id={id}>
      {children}
    </h2>
    <Dialog.Close className="-m-2 flex rounded p-2 hover:bg-hover" aria-label="Close">
      <Close12Icon className="text-secondary" />
    </Dialog.Close>
  </div>
))

Modal.Body = classed.div`py-2 overflow-y-auto`

Modal.Section = classed.div`p-4 space-y-4 border-b border-secondary text-secondary last-of-type:border-none text-sans-md`

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
  cancelText,
  disabled = false,
}: {
  children?: React.ReactNode
  onDismiss: () => void
  onAction: () => void
  actionType?: 'primary' | 'danger'
  actionText: React.ReactNode
  cancelText?: string
  disabled?: boolean
}) => (
  <footer className="flex items-center justify-between border-t px-3 py-3 border-secondary">
    <div className="mr-4">{children}</div>
    <div className="space-x-2">
      <Button variant="secondary" size="sm" onClick={onDismiss}>
        {cancelText || 'Cancel'}
      </Button>
      <Button size="sm" variant={actionType} onClick={onAction} disabled={disabled}>
        {actionText}
      </Button>
    </div>
  </footer>
)
