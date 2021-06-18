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

export function RouterTabs(props: Props) {
  const history = useHistory()

  const baseMatch = useRouteMatch()
  const tabMatch = useRouteMatch<{ tab: string }>(`${baseMatch.path}/:tab?`)
  const tab = tabMatch?.params.tab || ''

  let tabIndex = props.tabs.findIndex((t) => t.path === `/${tab}`)
  tabIndex = tabIndex === -1 ? 0 : tabIndex // default 0 if no match

  const baseUrl = baseMatch.url.replace(/\/*$/g, '') // trim trailing slashes
  const onChangeTab = (i: number) => {
    history.push(`${baseUrl}${props.tabs[i].path}`)
  }

  return (
    <Tabs
      css={selectedTabStyle}
      keyboardActivation={TabsKeyboardActivation.Manual}
      index={tabIndex}
      onChange={onChangeTab}
      className={props.className}
    >
      <TabList tw="flex space-x-3 mb-3">
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
