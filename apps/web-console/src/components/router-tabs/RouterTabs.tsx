import type { ReactNode } from 'react'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabsKeyboardActivation,
} from '@reach/tabs'
import tw, { css } from 'twin.macro'

import { Button } from '@oxide/ui'

const buttonStyle = tw`flex-1 border-0 border-b border-current text-green-50 hover:text-green-500`

const selectedTabStyle = css`
  [data-reach-tab][data-selected] {
    ${tw`text-green-500`}
  }
`

type TabData = { label: string; path: string }

type Props = {
  tabs: TabData[]
  children: ReactNode
  className?: string
}

const getTabIndex = (tabs: TabData[], slug: string) => {
  const index = tabs.findIndex((t) => t.path === `/${slug || ''}`)
  // if nothing matches, default to 0
  return index === -1 ? 0 : index
}

type Params = { tab: string }

export function RouterTabs(props: Props) {
  const history = useHistory()

  const baseMatch = useRouteMatch()
  const tabMatch = useRouteMatch<Params>(`${baseMatch.path}/:tab?`)
  const tab = tabMatch?.params.tab || ''

  // trim trailing slashes
  const basePath = baseMatch.url.replace(/\/*$/g, '')
  const onChangeTab = (i: number) => {
    history.push(`${basePath}${props.tabs[i].path}`)
  }

  return (
    <Tabs
      css={selectedTabStyle}
      keyboardActivation={TabsKeyboardActivation.Manual}
      index={getTabIndex(props.tabs, tab)}
      onChange={onChangeTab}
      className={props.className}
    >
      <TabList tw="flex space-x-3">
        {props.tabs.map((t) => (
          <Tab as={Button} key={t.label} variant="ghost" css={buttonStyle}>
            {t.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>{props.children}</TabPanels>
    </Tabs>
  )
}
