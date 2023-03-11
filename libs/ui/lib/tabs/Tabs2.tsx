import { Content, List, Root, Trigger } from '@radix-ui/react-tabs'

import { classed } from '@oxide/util'

import './Tabs.css'

export const Tabs2 = {
  Root: classed.inject(Root, 'ox-tabs'),
  // TODO: move padding into ox-tab after converting the call sites
  Trigger: classed.inject(Trigger, 'ox-tab !px-3'),
  List: classed.inject(List, 'ox-tabs-list'),
  Content: classed.inject(Content, 'ox-tab-panel ox-tabs-panel'),
}
