import React from 'react'
import type { DialogProps } from '@reach/dialog'
import Dialog from '@reach/dialog'
import { Button } from '../button/Button'
import { pluckType } from '../../util/children'
import type { ChildrenProp } from '../../util/children'
import { CloseSmallIcon } from '../icons'

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
  const footer = pluckType(childArray, SideModal.Footer)
  const titleId = `${id}-title`

  return (
    <Dialog
      id={id}
      onDismiss={onDismiss}
      {...dialogProps}
      className="absolute right-0 top-0 bottom-0 w-[32rem] p-0 m-0 flex flex-col justify-between bg-gray-500 border-l border-gray-400"
      aria-labelledby={titleId}
    >
      <div
        style={{ maxHeight: 'calc(100vw - 5rem)' }}
        className="overflow-y-auto"
      >
        {/* Title */}
        <div className="flex justify-between mt-2 mb-8 p-6">
          <h2 className="text-display-xl" id={titleId}>
            {title}
          </h2>
          <Button variant="link" onClick={onDismiss}>
            <CloseSmallIcon title="Close" />
          </Button>
        </div>
        {/* Body */}
        <div className="divide-y">{childArray}</div>
      </div>
      {footer}
    </Dialog>
  )
}

SideModal.Section = ({ children }: ChildrenProp) => (
  <div className="p-8 space-y-6 border-gray-400">{children}</div>
)

SideModal.Docs = ({ children }: ChildrenProp) => (
  <SideModal.Section>
    <div>
      <h3 className="font-medium">Relevant docs</h3>
      <ul className="text-gray-100">
        {React.Children.map(children, (child) => (
          <li>{child}</li>
        ))}
      </ul>
    </div>
  </SideModal.Section>
)

SideModal.Footer = ({ children }: ChildrenProp) => (
  <footer className="flex h-20 p-6 border-t border-gray-400 items-center justify-end">
    {children}
  </footer>
)
