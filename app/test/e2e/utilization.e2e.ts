import { expectNotVisible, expectVisible, test } from './utils'

// not trying to get elaborate here. just make sure the pages load, which
// exercises the loader prefetches and invariant checks

test('System utilization', async ({ page }) => {
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

test('Silo utilization', async ({ page }) => {
  await page.goto('/utilization')
  await expectVisible(page, [page.getByRole('heading', { name: 'Capacity & Utilization' })])
  await expectNotVisible(page, [
    page.getByText('Disk utilization'),
    page.getByText('CPU utilization'),
    page.getByText('Memory utilization'),
    // stats under the graph which require capacity info
    page.getByText('In-use'),
  ])
})
