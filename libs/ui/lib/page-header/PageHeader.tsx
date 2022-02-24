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
    <h1 className="inline-flex items-center space-x-2 text-sans-3xl text-accent">
      <span className="mb-1 h-2.5 w-8 border-l border-b border-default" />
      {cloneElement(icon, { className: 'text-accent-secondary' })}
      <span>{children}</span>
    </h1>
  )
}
