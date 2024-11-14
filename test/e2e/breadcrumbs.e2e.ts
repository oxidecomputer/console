/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test, type Page } from '@playwright/test'

async function getCrumbs(page: Page) {
  const links = await page
    .getByRole('navigation', { name: 'Breadcrumbs' })
    .getByRole('link')
    .all()
  return Promise.all(
    links.map(async (link) => [await link.textContent(), await link.getAttribute('href')])
  )
}

type Pair = [string, string]

async function expectCrumbs(page: Page, crumbs: Pair[]) {
  await expect.poll(() => getCrumbs(page)).toEqual(crumbs)
}

const projectCrumbs: Pair[] = [
  ['Projects', '/projects'],
  ['mock-project', '/projects/mock-project/instances'],
]

// Not trying to get too comprehensive about testing the crumbs, that's what the
// big snapshot unit test is for. Just testing a couple of cases here to make
// sure the functions tested by the unit test are hooked up right in the UI.
test('breadcrumbs', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs')
  const vpcsCrumbs: Pair[] = [...projectCrumbs, ['VPCs', '/projects/mock-project/vpcs']]
  await expectCrumbs(page, vpcsCrumbs)

  // the breadcrumbs should be the same with the form open because
  // the form route doesn't have its own crumb
  await page.getByRole('link', { name: 'New VPC' }).click()
  await expect(page).toHaveURL('/projects/mock-project/vpcs-new')
  await expectCrumbs(page, vpcsCrumbs)

  // try a nested one with a tab
  await page.goto('/projects/mock-project/instances/db1/networking')
  await expectCrumbs(page, [
    ...projectCrumbs,
    ['Instances', '/projects/mock-project/instances'],
    ['db1', '/projects/mock-project/instances/db1/storage'],
    ['Networking', '/projects/mock-project/instances/db1/networking'],
  ])

  // test a settings page
  await page.goto('/settings/ssh-keys')
  await expectCrumbs(page, [
    ['Settings', '/settings/profile'],
    ['SSH Keys', '/settings/ssh-keys'],
  ])

  // test a couple of system pages
  await page.goto('/system/silos/maze-war')
  const siloCrumbs: Pair[] = [
    ['Silos', '/system/silos'],
    ['maze-war', '/system/silos/maze-war'],
  ]
  await expectCrumbs(page, siloCrumbs)
  // same crumbs on IdP detail side modal
  await page.getByRole('link', { name: 'mock-idp' }).click()
  await expect(page).toHaveURL('/system/silos/maze-war/idps/saml/mock-idp')
  await expectCrumbs(page, siloCrumbs)

  await page.goto('/system/networking/ip-pools/ip-pool-1')
  const poolCrumbs: Pair[] = [
    ['IP Pools', '/system/networking/ip-pools'],
    ['ip-pool-1', '/system/networking/ip-pools/ip-pool-1'],
  ]
  await expectCrumbs(page, poolCrumbs)
  await page.goto('/system/networking/ip-pools/ip-pool-1/ranges-add')
  await expectCrumbs(page, poolCrumbs)
})
