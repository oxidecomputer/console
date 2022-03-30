import React from 'react'
import type { DialogProps } from '@reach/dialog'
import Dialog from '@reach/dialog'
import { Button } from '../button/Button'
import { classed, pluckFirstOfType } from '@oxide/util'
import type { ChildrenProp } from '@oxide/util'
import { Close12Icon, OpenLink12Icon } from '../icons'

export interface SideModalProps extends DialogProps, ChildrenProp {
  id: string
  title: string
}

export function SideModal_old({
  id,
  title,
  children,
  onDismiss,
  ...dialogProps
}: SideModalProps) {
  const childArray = React.Children.toArray(children)
  const footer = pluckFirstOfType(childArray, SideModal_old.Footer)
  const titleId = `${id}-title`

  return (
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
          <h2 className="mt-2 text-sans-2xl" id={titleId}>
            {title}
          </h2>
          <Button variant="link" onClick={onDismiss}>
            <Close12Icon />
          </Button>
        </div>
        {/* Body */}
        <div className="divide-y">{childArray}</div>
      </div>
      {footer}
    </Dialog>
  )
}

SideModal_old.Section = classed.div`p-8 space-y-6 border-secondary`

SideModal_old.Docs = ({ children }: ChildrenProp) => (
  <SideModal_old.Section>
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
  </SideModal_old.Section>
)

SideModal_old.Footer = ({ children }: ChildrenProp) => (
  <footer className="flex h-20 items-center justify-end border-t p-6 border-secondary">
    {children}
  </footer>
)
