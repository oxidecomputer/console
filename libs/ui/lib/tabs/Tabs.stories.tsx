import { Badge } from '@oxide/ui'

import { Tab, Tabs } from './Tabs'

export const Default = () => (
  <Tabs id="default" aria-label="A simple example of the tabs component">
    <Tab>hello</Tab>
    <Tab.Panel>tab view 1</Tab.Panel>
    <Tab>world</Tab>
    <Tab.Panel>tab view 2</Tab.Panel>
  </Tabs>
)

export const WithItemCount = () => (
  <Tabs id="default" aria-label="An example of the tabs component with a badge">
    <Tab>no items</Tab>
    <Tab.Panel>Nothing to see here</Tab.Panel>
    <Tab>
      items <Badge>1</Badge>
    </Tab>
    <Tab.Panel>You have 4 unread messages</Tab.Panel>
  </Tabs>
)
