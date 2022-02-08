import type { ReactElement } from 'react'
import { cloneElement } from 'react'
import React from 'react'

import { classed } from '@oxide/util'

export const PageHeader = classed.header`flex items-center justify-between mb-16 mt-4`

interface Props {
  icon: ReactElement
  children: React.ReactNode
}

export const PageTitle = ({ children, icon }: Props) => {
  return (
    <h1 className="inline-flex items-center text-accent text-sans-2xl space-x-2">
      <span className="border-l border-b border-secondary w-8 h-2.5" />
      {cloneElement(icon, { className: 'mt-1 text-accent-secondary' })}
      <span>{children}</span>
    </h1>
  )
}
