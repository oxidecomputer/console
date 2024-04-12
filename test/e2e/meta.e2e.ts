import { expect, test } from '@playwright/test'

test('CSP headers', async ({ page }) => {
  // doesn't matter what page we go to
  const response = await page.goto('/')
  expect(response?.headers()).toMatchObject({
    // note nonce is represented as [0-9a-f]+
    'content-security-policy': expect.stringMatching(
      /^default-src 'self'; style-src 'unsafe-inline' 'self'; frame-src 'none'; object-src 'none'; form-action 'none'; frame-ancestors 'none'; script-src 'nonce-[0-9a-f]+' 'self'$/
    ),
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
  })
})
