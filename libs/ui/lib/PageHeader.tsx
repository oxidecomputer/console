import React from 'react'

import type { IconName } from './icon/icons'
import { classed } from '../util/classed'

export const PageHeader = classed.header`flex items-center justify-between mt-2.5 mb-10`

interface Props {
  icon: IconName
  children: React.ReactNode
}

export const PageTitle = ({ children }: Props) => (
  <h1 className="inline-flex items-center text-green-500 text-display-2xl">
    <span className="border-l border-b border-green-500 w-10 h-2.5 mr-4" />
    {children}
  </h1>
)
