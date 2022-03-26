import type { ReactElement } from 'react'
import React from 'react'

import { classed } from '@oxide/util'

export const PageHeader = classed.header`flex items-center justify-between mb-24 mt-4`

interface Props {
  icon?: ReactElement
  children: string
}

export const PageTitle = ({ children: title, icon }: Props) => {
  return (
    <h1 className="inline-flex items-center space-x-2 text-sans-3xl text-accent-secondary">
      <span className="mb-1 h-2.5 w-8 border-l border-b border-default" />
      {icon}
      <span className="text-accent">{title}</span>
    </h1>
  )
}
