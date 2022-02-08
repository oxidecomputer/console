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

export function SideModal({
  id,
  title,
  children,
  onDismiss,
  ...dialogProps
}: SideModalProps) {
  const childArray = React.Children.toArray(children)
  const footer = pluckFirstOfType(childArray, SideModal.Footer)
  const titleId = `${id}-title`

  return (
    <Dialog
      id={id}
      onDismiss={onDismiss}
      {...dialogProps}
      className="absolute right-0 top-0 bottom-0 w-[32rem] p-0 m-0 flex flex-col justify-between bg-default border-l border-secondary"
      aria-labelledby={titleId}
    >
      <div
        style={{ maxHeight: 'calc(100vw - 5rem)' }}
        className="overflow-y-auto"
      >
        {/* Title */}
        <div className="flex justify-between mt-2 mb-8 p-6">
          <h2 className="text-sans-2xl mt-2" id={titleId}>
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

SideModal.Section = classed.div`p-8 space-y-6 border-secondary`

SideModal.Docs = ({ children }: ChildrenProp) => (
  <SideModal.Section>
    <div>
      <h3 className="text-sans-semi-md mb-2">Relevant docs</h3>
      <ul className="text-secondary text-sans-md space-y-0.5">
        {React.Children.map(children, (child) => (
          <li className="flex items-center space-x-2">
            <OpenLink12Icon className="text-accent mt-0.5" />
            {child}
          </li>
        ))}
      </ul>
    </div>
  </SideModal.Section>
)

SideModal.Footer = ({ children }: ChildrenProp) => (
  <footer className="flex h-20 p-6 border-t border-secondary items-center justify-end">
    {children}
  </footer>
)
