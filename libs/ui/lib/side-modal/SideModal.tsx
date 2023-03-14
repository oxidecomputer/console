import { DialogContent, DialogOverlay } from '@reach/dialog'
import { animated, useTransition } from '@react-spring/web'
import React, { createContext, useContext, useState } from 'react'

import { classed } from '@oxide/util'

import { OpenLink12Icon } from '../icons'
import './side-modal.css'

const SideModalContext = createContext(false)

export const useIsInSideModal = () => {
  return useContext(SideModalContext)
}

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
}

export function SideModal({
  children,
  onDismiss,
  title,
  isOpen,
  animate = true,
}: SideModalProps) {
  const titleId = 'side-modal-title'
  const AnimatedDialogContent = animated(DialogContent)
  const [status, setStatus] = useState('focus-unlocked')

  const config = { tension: 650, mass: 0.125 }

  const transitions = useTransition(isOpen, {
    from: { x: 50 },
    enter: { x: 0 },
    onRest: () => {
      setStatus(isOpen ? 'focus-locked' : 'focus-unlocked') // if done opening, lock focus. if done closing, unlock focus
    },
    config: isOpen && animate ? config : { duration: 0 },
  })

  return (
    <SideModalContext.Provider value>
      {transitions(
        ({ x }, item) =>
          item && (
            <DialogOverlay
              onDismiss={onDismiss}
              dangerouslyBypassFocusLock={status === 'focus-unlocked'}
            >
              <AnimatedDialogContent
                className="ox-side-modal fixed right-0 top-0 bottom-0 m-0 flex w-[32rem] flex-col justify-between border-l p-0 bg-raise border-secondary elevation-2"
                aria-labelledby={titleId}
                style={{
                  transform: x.to((value) => `translate3d(${value}%, 0px, 0px)`),
                }}
              >
                {title && <SideModal.Title id={titleId}>{title}</SideModal.Title>}
                {children}
              </AnimatedDialogContent>
            </DialogOverlay>
          )
      )}
    </SideModalContext.Provider>
  )
}

SideModal.Title = classed.h2`mt-8 mb-12 text-sans-2xl`

SideModal.Body = classed.div`body relative overflow-y-auto h-full pb-6`

SideModal.Section = classed.div`p-8 space-y-6 border-secondary`

SideModal.Docs = ({ children }: { children?: React.ReactNode }) => (
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
