/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createRoutesStub, useLoaderData, useNavigation } from 'react-router'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Tabs } from '~/ui/lib/Tabs'

import { QueryParamTabs } from './QueryParamTabs'

test('waits for the loader before showing the new tab', async () => {
  let finishLoad = () => {}
  // tab each render of the second panel saw in loader data
  const panelTwoRenders: string[] = []

  function PanelTwo() {
    const { tab } = useLoaderData<{ tab: string }>()
    panelTwoRenders.push(tab)
    return <p>Panel two</p>
  }

  function Page() {
    // like the loading bar in RootLayout, which rerenders while the nav is pending
    const navigation = useNavigation()
    return (
      <QueryParamTabs defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">
          <p>Panel one</p>
        </Tabs.Content>
        <Tabs.Content value="two">
          <PanelTwo />
        </Tabs.Content>
        <p>Navigation {navigation.state}</p>
      </QueryParamTabs>
    )
  }

  const Stub = createRoutesStub([
    {
      path: '/',
      Component: Page,
      // like a page loader that only prefetches the current tab's data
      loader: async ({ request }) => {
        const tab = new URL(request.url).searchParams.get('tab') ?? 'one'
        if (tab === 'two') await new Promise<void>((resolve) => (finishLoad = resolve))
        return { tab }
      },
    },
  ])

  const screen = await render(<Stub />)
  await expect.element(screen.getByText('Panel one')).toBeVisible()

  await screen.getByRole('tab', { name: 'Two' }).click()
  await expect.element(screen.getByText('Navigation loading')).toBeInTheDocument()
  // still on the old tab while the new tab's loader runs
  await expect.element(screen.getByText('Panel one')).toBeVisible()
  expect(panelTwoRenders).toEqual([])

  finishLoad()
  await expect.element(screen.getByText('Panel two')).toBeVisible()
  expect(panelTwoRenders).not.toContain('one')
})
