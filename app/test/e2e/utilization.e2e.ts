import { expect, expectNotVisible, expectVisible, getDevUserPage, test } from './utils'

// not trying to get elaborate here. just make sure the pages load, which
// exercises the loader prefetches and invariant checks

test.describe('System utilization', () => {
  test('works for fleet viewer', async ({ page }) => {
    await page.goto('/system/utilization')
    await expectVisible(page, [
      page.getByRole('heading', { name: 'Capacity & Utilization' }),
      page.getByText('Disk utilization'),
      page.getByText('CPU utilization'),
      page.getByText('Memory utilization'),
      // stats under the graph which require capacity info
      page.getByText('In-use').first(),
    ])
  })

  test('does not appear for dev user', async ({ browser }) => {
    const page = await getDevUserPage(browser)
    await page.goto('/system/utilization')
    await expect(page.getByText('Page not found')).toBeVisible()
  })
})

test.describe('Silo utilization', () => {
  test('works for fleet viewer', async ({ page }) => {
    await page.goto('/utilization')
    await expectVisible(page, [
      page.getByRole('heading', { name: 'Capacity & Utilization' }),
    ])
    await expectNotVisible(page, [
      page.getByText('Disk utilization'),
      page.getByText('CPU utilization'),
      page.getByText('Memory utilization'),
      // stats under the graph which require capacity info
      page.getByText('In-use'),
    ])
  })

  test('works for dev user', async ({ browser }) => {
    const page = await getDevUserPage(browser)
    await page.goto('/utilization')
    await expectVisible(page, [
      page.getByRole('heading', { name: 'Capacity & Utilization' }),
    ])
    await expectNotVisible(page, [
      page.getByText('Disk utilization'),
      page.getByText('CPU utilization'),
      page.getByText('Memory utilization'),
      // stats under the graph which require capacity info
      page.getByText('In-use'),
    ])
  })
})

// TODO: it would be nice to test that actual data shows up in the graphs and
// the date range picker works as expected, but it's hard to do asserts about
// the graphs because they're big SVGs, the data coming from MSW is randomized,
// and the time ranges move with the current time. Will think about it.
