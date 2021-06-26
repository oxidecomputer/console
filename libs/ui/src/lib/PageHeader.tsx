import React from 'react'

import type { IconName } from './icon/icons'
import { Icon } from './icon/Icon'
import { classed } from '../util/classed'

export const PageHeader = classed.header`flex items-center justify-between mt-3`

interface Props {
  icon: IconName
  children: React.ReactNode
}

export const PageTitle = ({ icon, children }: Props) => (
  <h1 className="inline-flex text-2xl text-green-500 font-mono font-normal uppercase">
    <Icon className="!w-8 mr-3" name={icon} />
    {children}
  </h1>
)
