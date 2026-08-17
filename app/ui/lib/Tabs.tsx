/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import cn from 'classnames'

// They don't require a default value, but without it there is no tab selected
// by default.
export type TabsRootProps = BaseTabs.Root.Props & { defaultValue: string }

export const Tabs = {
  Root: ({ className, ...props }: TabsRootProps) => (
    <BaseTabs.Root {...props} className={cn('ox-tabs', className)} />
  ),
  Trigger: ({ children, className, ...props }: BaseTabs.Tab.Props) => (
    <BaseTabs.Tab {...props} className={cn('ox-tab', className)}>
      {/* this div needs to be here for the background on `ox-tab:hover > *` */}
      <div>{children}</div>
    </BaseTabs.Tab>
  ),
  List: ({ className, ...props }: BaseTabs.List.Props) => (
    <BaseTabs.List {...props} className={cn('ox-tabs-list', className)} />
  ),
  Content: ({ className, ...props }: BaseTabs.Panel.Props) => (
    <BaseTabs.Panel {...props} className={cn('ox-tabs-panel', className)} />
  ),
}
