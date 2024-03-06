/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  Content,
  List,
  Root,
  Trigger,
  type TabsContentProps,
  type TabsListProps,
  type TabsProps,
  type TabsTriggerProps,
} from '@radix-ui/react-tabs'
import cn from 'classnames'
import type { SetRequired } from 'type-fest'

// They don't require a default value, but without it there is no tab selected
// by default.
export type TabsRootProps = SetRequired<TabsProps, 'defaultValue'>

export const Tabs = {
  Root: ({ className, ...props }: TabsRootProps) => (
    <Root {...props} className={cn('ox-tabs', className)} />
  ),
  Trigger: ({ children, className, ...props }: TabsTriggerProps) => (
    <Trigger {...props} className={cn('ox-tab', className)}>
      {/* this div needs to be here for the background on `ox-tab:hover > *` */}
      <div>{children}</div>
    </Trigger>
  ),
  List: ({ className, ...props }: TabsListProps) => (
    <List {...props} className={cn('ox-tabs-list', className)} />
  ),
  Content: ({ className, ...props }: TabsContentProps) => (
    <Content {...props} className={cn('ox-tabs-panel', className)} />
  ),
}
