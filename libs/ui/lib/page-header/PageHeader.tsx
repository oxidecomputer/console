import type { ReactElement } from 'react'

import { classed } from '@oxide/util'

export const PageHeader = classed.header`mb-16 mt-12 flex items-center justify-between`

interface PageTitleProps {
  icon?: ReactElement
  children: string
}
export const PageTitle = ({ children: title, icon }: PageTitleProps) => {
  return (
    <h1 className="inline-flex items-center space-x-2 text-sans-3xl text-accent-secondary">
      {icon}
      <span className="text-accent">{title}</span>
    </h1>
  )
}
