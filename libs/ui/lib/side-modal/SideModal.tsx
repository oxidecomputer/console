import * as Dialog from '@radix-ui/react-dialog'
import { animated, useTransition } from '@react-spring/web'
import React, { type ReactNode } from 'react'

import { classed } from '@oxide/util'

import { OpenLink12Icon } from '../icons'
import './side-modal.css'

export type SideModalResource = { icon: ReactNode; name: string }

export type SideModalProps = {
  title?: string
  onDismiss: () => void
  isOpen: boolean
  children?: React.ReactNode
  /**
   * Whether the modal should animate in. It never animates out. Default `true`.
   * Used to prevent animation from firing when we show the modal directly on a
   * fresh pageload.
   */
  animate?: boolean
  resource?: SideModalResource
}

export function SideModal({
  children,
  onDismiss,
  title,
  isOpen,
  animate = true,
  resource,
}: SideModalProps) {
  const titleId = 'side-modal-title'
  const AnimatedDialogContent = animated(Dialog.Content)

  const config = { tension: 650, mass: 0.125 }

  const transitions = useTransition(isOpen, {
    from: { x: 50 },
    enter: { x: 0 },
    config: isOpen && animate ? config : { duration: 0 },
  })

  return transitions(
    ({ x }, item) =>
      item && (
        <Dialog.Root
          open
          onOpenChange={(open) => {
            if (!open) onDismiss()
          }}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <AnimatedDialogContent
              className="DialogContent ox-side-modal fixed right-0 top-0 bottom-0 m-0 flex w-[32rem] flex-col justify-between border-l p-0 bg-raise border-secondary elevation-2"
              aria-labelledby={titleId}
              style={{
                transform: x.to((value) => `translate3d(${value}%, 0px, 0px)`),
              }}
            >
              {title && (
                <Dialog.Title asChild>
                  <>
                    <SideModal.Title id={titleId} title={title} resource={resource} />
                  </>
                </Dialog.Title>
              )}
              {children}
            </AnimatedDialogContent>
          </Dialog.Portal>
        </Dialog.Root>
      )
  )
}

SideModal.Title = ({
  title,
  id,
  resource,
}: {
  title: string
  id?: string
  resource?: SideModalResource
}) => (
  <div className="mt-8 mb-12" id={id}>
    <h2 className="text-sans-2xl">{title}</h2>
    {resource && (
      <div className="mt-2 flex items-center gap-1.5 text-sans-md text-accent">
        {resource.icon} {resource.name}
      </div>
    )}
  </div>
)

SideModal.Body = classed.div`body relative overflow-y-auto h-full pb-12`

SideModal.Section = classed.div`p-8 space-y-6 border-secondary`

SideModal.Docs = ({ children }: { children?: ReactNode }) => (
  <SideModal.Section>
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
  </SideModal.Section>
)

SideModal.Footer = classed.footer`flex py-5 border-t border-secondary`
