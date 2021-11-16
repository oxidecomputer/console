import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import type { TabLabelProps } from './Tabs'
import { Tabs } from './Tabs'
import React from 'react'

type Story = StoryObj<
  ComponentProps<typeof Tabs> & {
    tabs: Array<string | TabLabelProps>
    views: React.ReactNode
  }
>

export default {
  component: Tabs,
  render: (args) => {
    console.log({ args })
    return (
      <Tabs>
        <Tabs.List>
          {args.tabs.map((tab) =>
            typeof tab === 'string' ? (
              <Tabs.Label>{tab}</Tabs.Label>
            ) : (
              <Tabs.Label {...tab} />
            )
          )}
        </Tabs.List>
        <Tabs.Views>
          {React.Children.map(args.views, (view) => view)}
        </Tabs.Views>
      </Tabs>
    )
  },
  args: {},
} as Story

export const Default: Story = {
  args: {
    tabs: ['hello', 'world'],
    views: ['tab view 1', 'tab view 2'],
  },
}

export const WithItemCount: Story = {
  args: {
    tabs: ['no items', { badge: '4', children: 'items' }],
    views: ['Nothing to see here', 'You have 4 unread messages'],
  },
}
