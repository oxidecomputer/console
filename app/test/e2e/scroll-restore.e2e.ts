import { type Page, expect, test } from './utils'

async function expectScrollTop(page: Page, expected: number) {
  const container = await page.getByTestId('scroll-container')
  const getScrollTop = () => container.evaluate((el: HTMLElement) => el.scrollTop)
  await expect.poll(getScrollTop).toBe(expected)
}

async function scrollTo(page: Page, to: number) {
  const container = await page.getByTestId('scroll-container')
  await container.evaluate((el: HTMLElement, to) => el.scrollTo(0, to), to)
}

test('scroll restore', async ({ page }) => {
  // open small window to make scrolling easier
  await page.setViewportSize({ width: 800, height: 500 })

  // nav to disks and scroll it
  await page.goto('/projects/mock-project/disks')
  await expectScrollTop(page, 0)
  await scrollTo(page, 143)

  // nav to snapshots
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await expectScrollTop(page, 0)

  // go back to disks, scroll is restored, scroll it some more
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expectScrollTop(page, 143)
  await scrollTo(page, 190)

  // go forward to snapshots, now scroll it
  await page.goForward()
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 0)
  await scrollTo(page, 30)

  // new nav to disks
  await page.getByRole('link', { name: 'Disks' }).click()
  await expectScrollTop(page, 0)

  // this is too flaky so forget it for now

  // random reload in there because we use sessionStorage. note we are
  // deliberately on the disks page here because there's a quirk in playwright
  // that seems to reset to the disks page on reload
  // await page.reload()

  // back to snapshots, scroll is restored
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 30)

  // back again to disks, newer scroll value is restored
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expectScrollTop(page, 190)

  // forward again to newest disks history entry, scroll remains 0
  await page.goForward()
  await page.goForward()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expectScrollTop(page, 0)
})
