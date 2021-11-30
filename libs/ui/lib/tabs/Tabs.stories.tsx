import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import type { TabProps } from './Tabs'
import { Tabs, Tab } from './Tabs'
import React, { Fragment } from 'react'
import { Badge } from '@oxide/ui'
import { flattenChildren } from 'libs/ui/util/children'

type Story = StoryObj<
  ComponentProps<typeof Tabs> & {
    label: string
    tabs: React.ReactNode[] | React.ReactElement
    panels: React.ReactNode[]
  }
>

export default {
  component: Tabs,
  render: (args) => {
    return (
      <Tabs aria-label={args.label} id="tabs-example">
        {flattenChildren(args.tabs).map((tab, i) => (
          <Fragment key={`tab-group-${i}`}>
            {typeof tab === 'string' ? <Tab>{tab}</Tab> : tab}
            <Tab.Panel>{args.panels[i]}</Tab.Panel>
          </Fragment>
        ))}
      </Tabs>
    )
  },
  args: {},
} as Story

export const Default: Story = {
  args: {
    label: 'A simple example of the tabs component',
    tabs: ['hello', 'world'],
    panels: ['tab view 1', 'tab view 2'],
  },
}

export const WithItemCount: Story = {
  args: {
    label: 'An example of the tabs component with a badge',
    tabs: (
      <>
        <Tab>no items</Tab>
        <Tab>
          items <Badge>1</Badge>
        </Tab>
      </>
    ),
    panels: ['Nothing to see here', 'You have 4 unread messages'],
  },
}
