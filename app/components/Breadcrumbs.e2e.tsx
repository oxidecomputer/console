import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

type Crumb = {
  text: string
  href?: string
}

async function expectCrumbs(page: Page, crumbs: Crumb[]) {
  const crumbsInPage = page.locator(`data-testid=Breadcrumbs >> role=listitem`)
  // crumbs should be shorter by one
  // since that is the page we are already on
  await expect(crumbsInPage).toHaveCount(Math.max(crumbs.length - 1, 0)) // unmatched route should = 0 not -1

  for (let i = 0; i < crumbs.length - 1; i++) {
    const { text, href } = crumbs[i]
    const listItem = crumbsInPage.nth(i)
    await expect(listItem).toHaveText(text)
    const link = listItem.locator('role=link')
    if (typeof href === 'string') {
      await expect(link).toHaveAttribute('href', href)
    } else {
      await expect(link).toHaveCount(0)
    }
  }
}

async function expectTitle(page: Page, title: string) {
  expect(await page.title()).toEqual(title)
}

test.describe('Breadcrumbs', () => {
  test('not present on unmatched route', async ({ page }) => {
    await page.goto('/abc/def')
    await expectCrumbs(page, [])
    await expectTitle(page, 'Oxide Console')
  })

  test('works on VPC detail', async ({ page }) => {
    await page.goto('/projects/mock-project/vpcs/mock-vpc/')
    await expectCrumbs(page, [
      { text: 'maze-war', href: '/' },
      { text: 'Projects', href: '/projects' },
      {
        text: 'mock-project',
        href: '/projects/mock-project',
      },
      {
        text: 'VPCs',
        href: '/projects/mock-project/vpcs',
      },
      { text: 'mock-vpc' },
    ])

    await expectTitle(
      page,
      'mock-vpc / VPCs / mock-project / Projects / maze-war / Oxide Console'
    )
  })
})
