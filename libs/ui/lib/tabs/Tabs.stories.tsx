import type { StoryObj } from '@storybook/react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Tabs, Tab } from './Tabs'
import { Fragment } from 'react'
import { Badge } from '@oxide/ui'
import { flattenChildren } from '@oxide/util'

type Story = StoryObj<
  ComponentProps<typeof Tabs> & {
    label: string
    tabs: ReactNode[] | ReactElement
    panels: ReactNode[]
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
