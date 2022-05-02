import React, { createContext, useContext } from 'react'
import type { DialogProps } from '@reach/dialog'
import Dialog from '@reach/dialog'
import { Button } from '../button/Button'
import { classed } from '@oxide/util'
import type { ChildrenProp } from '@oxide/util'
import { Close12Icon, OpenLink12Icon } from '../icons'
import './side-modal.css'

const SideModalContext = createContext(false)

export const useIsInSideModal = () => {
  return useContext(SideModalContext)
}

export interface SideModalProps extends DialogProps, ChildrenProp {
  id: string
  title?: string
}

export function SideModal({
  id,
  children,
  onDismiss,
  title,
  ...dialogProps
}: SideModalProps) {
  const titleId = `${id}-title`

  return (
    <SideModalContext.Provider value={true}>
      <Dialog
        id={id}
        onDismiss={onDismiss}
        {...dialogProps}
        className="ox-side-modal absolute right-0 top-0 bottom-0 m-0 flex w-[32rem] flex-col justify-between border-l p-0 bg-default border-secondary"
        aria-labelledby={titleId}
      >
        <Button
          variant="link"
          onClick={onDismiss}
          // 1.875rem is roughly the space between the close icon and its border
          className="absolute right-[calc(var(--content-gutter)-1.1875rem)] top-[1.8125rem] z-10 h-11 w-11 px-0"
        >
          <Close12Icon className="text-tertiary" />
        </Button>
        {title && <SideModal.Title id={`${id}-title`}>title</SideModal.Title>}
        {children}
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
