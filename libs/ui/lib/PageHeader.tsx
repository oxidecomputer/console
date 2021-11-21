import type { ReactElement } from 'react'
import { cloneElement } from 'react'
import React from 'react'

import { classed } from '../util/classed'

export const PageHeader = classed.header`flex items-center justify-between mb-4`

interface Props {
  icon: ReactElement
  children: React.ReactNode
}

export const PageTitle = ({ children, icon }: Props) => {
  return (
    <h1 className="inline-flex items-center text-green-500 text-display-2xl space-x-2">
      <span className="border-l border-b border-gray-300 w-10 h-2.5" />
      {cloneElement(icon, { className: 'mt-1 text-green-800' })}
      <span>{children}</span>
    </h1>
  )
}
