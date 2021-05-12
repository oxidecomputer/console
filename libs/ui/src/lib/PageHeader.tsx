import React from 'react'
import tw from 'twin.macro'

import type { IconName } from './icon/icons'
import { Icon } from './icon/Icon'

export const PageHeader = tw.header`flex items-center justify-between mt-3`

interface Props {
  icon: IconName
  children: React.ReactNode
}

// have to specify height on icon for safari. default height: auto misbehaves
export const PageTitle = ({ icon, children }: Props) => (
  <h1 tw="inline-flex text-2xl text-green-500 font-mono font-normal uppercase">
    <Icon tw="w-8 h-8 mr-3" name={icon} />
    {children}
  </h1>
)
