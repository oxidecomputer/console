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
    <h1 className="inline-flex items-center space-x-2 text-green-500 text-sans-2xl">
      <span className="h-2.5 w-10 border-l border-b border-gray-300" />
      {cloneElement(icon, { className: 'mt-1 text-green-800' })}
      <span>{children}</span>
    </h1>
  )
}
