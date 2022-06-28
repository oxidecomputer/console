import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

type Crumb = {
  text: string
  href?: string
}

async function expectCrumbs(page: Page, crumbs: Crumb[]) {
  const crumbsInPage = page.locator(`data-testid=Breadcrumbs >> role=listitem`)
  await expect(crumbsInPage).toHaveCount(crumbs.length)

  for (let i = 0; i < crumbs.length; i++) {
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
  await expect(await page.title()).toEqual(title)
}

test.describe('Breadcrumbs', () => {
  test('not present on unmatched route', async ({ page }) => {
    await page.goto('/abc/def')
    await expectCrumbs(page, [])
    await expectTitle(page, 'Oxide Console')
  })

  test('works on VPC detail', async ({ page }) => {
    await page.goto('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc/')
    await expectCrumbs(page, [
      { text: 'maze-war', href: '/orgs/maze-war' },
      { text: 'Projects', href: '/orgs/maze-war/projects' },
      {
        text: 'mock-project',
        href: '/orgs/maze-war/projects/mock-project',
      },
      {
        text: 'VPCs',
        href: '/orgs/maze-war/projects/mock-project/vpcs',
      },
      { text: 'mock-vpc' },
    ])

    await expectTitle(
      page,
      'mock-vpc / VPCs / mock-project / Projects / maze-war / Oxide Console'
    )
  })
})
