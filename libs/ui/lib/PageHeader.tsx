import React from 'react'

import type { IconName } from './icon/icons'
import { classed } from '../util/classed'
import { Icon } from './icon/Icon'

export const PageHeader = classed.header`flex items-center justify-between mt-2.5 mb-4`

interface Props {
  icon: IconName
  children: React.ReactNode
}

export const PageTitle = ({ children, icon }: Props) => {
  return (
    <h1 className="inline-flex items-center text-green-500 text-display-2xl">
      <span className="border-l border-b border-gray-300 w-10 h-2.5 mr-4" />
      <Icon className="!w-6 !h-6 mr-2 text-green-800" name={icon} />
      {children}
    </h1>
  )
}
