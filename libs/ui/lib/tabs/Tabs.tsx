import type { TabsTriggerProps } from '@radix-ui/react-tabs'
import { Content, List, Root, Trigger } from '@radix-ui/react-tabs'
import cn from 'classnames'

import { classed } from '@oxide/util'

import './Tabs.css'

export const Tabs = {
  Root: classed.inject(Root, 'ox-tabs'),
  Trigger: ({ children, className, ...props }: TabsTriggerProps) => (
    <Trigger {...props} className={cn('ox-tab', className)}>
      {/* this div needs to be here for the background on `ox-tab:hover > *` */}
      <div>{children}</div>
    </Trigger>
  ),
  List: classed.inject(List, 'ox-tabs-list'),
  Content: classed.inject(Content, 'ox-tabs-panel'),
}
