import type { ReactElement } from 'react'
import React from 'react'

import { classed } from '../util/classed'

export const PageHeader = classed.header`flex items-center justify-between mt-2.5 mb-4`

interface Props {
  icon: ReactElement
  children: React.ReactNode
}

export const PageTitle = ({ children, icon }: Props) => {
  return (
    <h1 className="inline-flex items-center text-green-500 text-display-2xl">
      <span className="border-l border-b border-gray-300 w-10 h-2.5 mr-4" />
      {icon}
      {children}
    </h1>
  )
}
