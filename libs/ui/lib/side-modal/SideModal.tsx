import type { DialogProps } from '@reach/dialog'
import { DialogContent, DialogOverlay } from '@reach/dialog'
import React, { createContext, useContext, useState } from 'react'
import { animated, useTransition } from 'react-spring'

import { classed } from '@oxide/util'
import type { ChildrenProp } from '@oxide/util'

import { OpenLink12Icon } from '../icons'
import './side-modal.css'

const SideModalContext = createContext(false)

export const useIsInSideModal = () => {
  return useContext(SideModalContext)
}

export interface SideModalProps extends Omit<DialogProps, 'isOpen'>, ChildrenProp {
  id: string
  title?: string
  // it's optional on DialogProps but we want to require it
  onDismiss: () => void
  isOpen: boolean
}

export function SideModal({
  id,
  children,
  onDismiss,
  title,
  isOpen,
  ...dialogProps
}: SideModalProps) {
  const titleId = `${id}-title`
  const AnimatedDialogContent = animated(DialogContent)
  const AnimatedDialogOverlay = animated(DialogOverlay)
  const [status, setStatus] = useState('focus-unlocked')

  const config = { tension: 500, mass: 0.125 }

  const transitions = useTransition(isOpen, {
    from: { opacity: 0, x: 100 },
    enter: { opacity: 0.6, x: 0 },
    leave: { opacity: 0, x: 100 },
    onRest: () => {
      setStatus(isOpen ? 'focus-locked' : 'focus-unlocked') // if done opening, lock focus. if done closing, unlock focus
    },
    config: isOpen ? config : { duration: 0 },
  })

  return (
    <SideModalContext.Provider value={true}>
      {transitions(
        (styles, item) =>
          item && (
            <AnimatedDialogOverlay
              onDismiss={onDismiss}
              dangerouslyBypassFocusLock={status === 'focus-unlocked'}
              style={{
                backgroundColor: styles.opacity.to(
                  (value) => `rgba(var(--base-black-700-rgb), ${value})`
                ),
              }}
            >
              <AnimatedDialogContent
                id={id}
                {...dialogProps}
                className="ox-side-modal fixed right-0 top-0 bottom-0 m-0 flex w-[32rem] flex-col justify-between border-l p-0 bg-default border-secondary"
                aria-labelledby={titleId}
                style={{
                  transform: styles.x.to((value) => `translate3d(${value}%, 0px, 0px)`),
                }}
              >
                {title && <SideModal.Title id={`${id}-title`}>title</SideModal.Title>}
                {children}
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </SideModalContext.Provider>
  )
}

interface SideModalTitleProps {
  id: string
  children: React.ReactNode
}
SideModal.Title = ({ id, children }: SideModalTitleProps) => {
  return (
    <h2 className="mt-8 mb-12 text-sans-2xl" id={id}>
      {children}
    </h2>
  )
}

SideModal.Body = classed.div`body relative overflow-y-auto h-full pb-6`

SideModal.Section = classed.div`p-8 space-y-6 border-secondary`

SideModal.Docs = ({ children }: ChildrenProp) => (
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

SideModal.Footer = ({ children }: ChildrenProp) => (
  <footer className="flex flex-row-reverse items-center justify-between border-t py-5 border-secondary">
    {children}
  </footer>
)
