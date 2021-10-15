import type { PropsWithChildren } from 'react'
import React from 'react'
import type { DialogProps } from '@reach/dialog'
import Dialog from '@reach/dialog'
import { Button } from '../button/Button'
import { Icon } from '../icon/Icon'
import { pluckType } from '../../util/children'

interface SideModalProps extends PropsWithChildren<DialogProps> {
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
  const Footer = pluckType(childArray, SideModal.Footer)

  return (
    <Dialog
      id={id}
      onDismiss={onDismiss}
      {...dialogProps}
      className="absolute right-0 top-0 bottom-0 w-[32rem] p-0 m-0 flex flex-col justify-between bg-gray-500 border-l border-gray-400"
      aria-labelledby={`${id}-title`}
    >
      <div
        style={{ maxHeight: 'calc(100vw - 5rem)' }}
        className="overflow-y-auto"
      >
        {/* Title */}
        <div className="flex justify-between mt-2 mb-8 p-6">
          <h2 className="text-display-xl" id={`${id}-title`}>
            {title}
          </h2>
          <Button variant="link" onClick={onDismiss}>
            <Icon name="close" />
          </Button>
        </div>
        {/* Body */}
        <div className="divide-y">{childArray}</div>
      </div>
      {Footer}
    </Dialog>
  )
}

SideModal.Section = ({ children }: PropsWithChildren<unknown>) => (
  <div className="p-8 space-y-6 border-gray-400">{children}</div>
)

SideModal.Docs = ({ children }: PropsWithChildren<unknown>) => (
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

SideModal.Footer = ({ children }: PropsWithChildren<unknown>) => (
  <footer className="flex h-20 p-6 border-t border-gray-400 items-center justify-end">
    {children}
  </footer>
)
