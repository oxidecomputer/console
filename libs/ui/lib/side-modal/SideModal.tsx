import React, { createContext, useContext } from 'react'
import type { DialogProps } from '@reach/dialog'
import Dialog from '@reach/dialog'
import { Button } from '../button/Button'
import { classed, pluckFirstOfType } from '@oxide/util'
import type { ChildrenProp } from '@oxide/util'
import { Close12Icon, OpenLink12Icon } from '../icons'

const SideModalContext = createContext(false)

export const useIsInSideModal = () => {
  return useContext(SideModalContext)
}

export interface SideModalProps extends DialogProps, ChildrenProp {
  id: string
  // TODO: Remove references to title prop
  title?: string
}

export function SideModal({
  id,
  children,
  onDismiss,
  title: titleProp,
  ...dialogProps
}: SideModalProps) {
  const titleId = `${id}-title`
  const childArray = React.Children.toArray(children)
  const title = pluckFirstOfType(childArray, SideModal.Title) || (
    <SideModal.Title id={titleId}>{titleProp}</SideModal.Title>
  )
  const footer = pluckFirstOfType(childArray, SideModal.Footer)

  return (
    <SideModalContext.Provider value={true}>
      <Dialog
        id={id}
        onDismiss={onDismiss}
        {...dialogProps}
        className="absolute right-0 top-0 bottom-0 m-0 flex w-[32rem] flex-col justify-between border-l p-0 bg-default border-secondary"
        aria-labelledby={titleId}
      >
        <div
          style={{ maxHeight: 'calc(100vh - 5rem)' }}
          className="overflow-y-auto"
        >
          {/* Title */}
          <div className="mt-2 mb-8 flex justify-between p-6">
            {title}
            <Button variant="link" onClick={onDismiss}>
              <Close12Icon />
            </Button>
          </div>
          {/* Body */}
          <div className="divide-y">{childArray}</div>
        </div>
        {footer}
      </Dialog>
    </SideModalContext.Provider>
  )
}

interface SideModalTitleProps {
  id: string
  children: React.ReactNode
}
SideModal.Title = ({ id, children }: SideModalTitleProps) => {
  return (
    <h2 className="mt-2 text-sans-2xl" id={id}>
      {children}
    </h2>
  )
}

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
  <footer className="flex h-20 items-center justify-end border-t p-6 border-secondary">
    {children}
  </footer>
)
