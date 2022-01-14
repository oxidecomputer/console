import type { ApiListMethods, ResultItem } from '@oxide/api'
import { BulkActionMenu as Menu } from '@oxide/ui'
import type { ComponentProps } from 'react'
import React from 'react'
import ReactDOM from 'react-dom'

export type BulkAction<A extends ApiListMethods, M extends keyof A> = {
  label: string
  icon: JSX.Element
  onActivate: (items: ResultItem<A[M]>[]) => void
}

interface BulkActionMenuProps extends ComponentProps<typeof Menu> {}
export function BulkActionMenu(props: BulkActionMenuProps) {
  return ReactDOM.createPortal(
    <Menu className="absolute" {...props} />,
    document.getElementById('popup-container')!
  )
}

BulkActionMenu.Button = Menu.Button
