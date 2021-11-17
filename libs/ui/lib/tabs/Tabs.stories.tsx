import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import type { TabProps } from './Tabs'
import { Tabs, Tab } from './Tabs'
import React from 'react'
import { Badge } from '@oxide/ui'

type Story = StoryObj<
  ComponentProps<typeof Tabs> & {
    tabs: Array<string | Omit<TabProps, 'id'>>
    panels: React.ReactNode[]
  }
>

export default {
  component: Tabs,
  render: (args) => {
    return (
      <Tabs>
        <Tab.List>
          {args.tabs.map((tab, i) => (
            <Tab id={`tab-${i}`} key={`tab-${i}`}>
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {args.panels.map((panel, i) => (
            <Tab.Panel for={`tab-${i}`} key={`tab-${i}-panel`}>
              {panel}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tabs>
    )
  },
  args: {},
} as Story

export const Default: Story = {
  args: {
    tabs: ['hello', 'world'],
    panels: ['tab view 1', 'tab view 2'],
  },
}

export const WithItemCount: Story = {
  args: {
    tabs: [
      'no items',
      <>
        items <Badge>1</Badge>
      </>,
    ],
    panels: ['Nothing to see here', 'You have 4 unread messages'],
  },
}
