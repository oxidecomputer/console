/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test, type Page } from '@playwright/test'

import {
  clickRowAction,
  clickRowActions,
  expectRowVisible,
  expectToast,
  selectOption,
} from './utils'

test('Alert receivers list', async ({ page }) => {
  await page.goto('/system/alerts')
  await expect(page).toHaveTitle('Alerts / Oxide Console')
  await expect(page.getByRole('heading', { name: 'Webhooks' })).toBeVisible()

  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(4) // header + 3 receivers

  await expectRowVisible(table, {
    name: 'webhook-1',
    Events: 'hardware.power_shelf.psu.insert+1',
    description: 'Main web deployments',
  })
  await expectRowVisible(table, { name: 'power-mon', Events: 'hardware.**' })
  await expectRowVisible(table, { name: 'general-sys-webhook', Events: '—' })
})

test('Webhook create', async ({ page }) => {
  await page.goto('/system/alerts')

  await page.getByRole('link', { name: 'New webhook' }).click()
  await expect(page).toHaveURL('/system/alerts-new')

  const modal = page.getByRole('dialog', { name: 'Create webhook' })
  await modal.getByRole('textbox', { name: 'Name' }).fill('deploy-hook')
  await modal.getByRole('textbox', { name: 'Description' }).fill('CI deploys')
  await modal.getByRole('textbox', { name: 'Secret' }).fill('super-secret')

  // endpoint must be a valid URL
  await modal.getByRole('textbox', { name: 'Endpoint URL' }).fill('not-a-url')
  await page.getByRole('button', { name: 'Create webhook' }).click()
  await expect(
    modal.getByText('Must be a valid URL, including the scheme (e.g., https://)')
  ).toBeVisible()
  await modal.getByRole('textbox', { name: 'Endpoint URL' }).fill('https://ci.example.com')

  // add a subscription: bad glob is rejected, good glob lands in the mini table
  const combobox = modal.getByRole('combobox', { name: 'Event classes' })
  await combobox.fill('hardware..bad')
  await modal.getByRole('button', { name: 'Add event class' }).click()
  await expect(
    modal.getByText('Must be an event class or a glob pattern like hardware.**')
  ).toBeVisible()
  await combobox.fill('hardware.**')
  // glob preview shows which classes the pattern currently matches
  await expect(modal.getByText('Matches 2 event classes')).toBeVisible()
  await modal.getByRole('button', { name: 'Add event class' }).click()
  await expect(
    modal.getByRole('table', { name: 'Event classes' }).getByRole('cell', {
      name: 'hardware.**',
      exact: true,
    })
  ).toBeVisible()

  await page.getByRole('button', { name: 'Create webhook' }).click()
  await expectToast(page, 'Webhook deploy-hook created')

  await expectRowVisible(page.getByRole('table'), {
    name: 'deploy-hook',
    Events: 'hardware.**',
    description: 'CI deploys',
  })
})

test('Webhook detail: properties, event classes, secrets', async ({ page }) => {
  await page.goto('/system/alerts')
  await page.getByRole('link', { name: 'webhook-1' }).click()
  await expect(page).toHaveURL('/system/alerts/webhook-1')

  await expect(page.getByRole('heading', { name: 'webhook-1' })).toBeVisible()
  await expect(page.getByText('https://fma.corp.oxide.computer')).toBeVisible()
  await expect(page.getByText('Main web deployments')).toBeVisible()

  // event classes card
  const eventClasses = page.getByRole('table', { name: 'Event classes' })
  await expect(eventClasses.getByRole('row')).toHaveCount(3) // header + 2

  // add a subscription
  await page.getByRole('button', { name: 'Add event class' }).click()
  const addModal = page.getByRole('dialog', { name: 'Add event class' })
  await addModal.getByRole('combobox', { name: 'Subscription' }).fill('probe')
  await page.getByRole('option', { name: 'probe' }).click()
  await addModal.getByRole('button', { name: 'Add' }).click()
  await expectToast(page, 'Subscribed to probe')
  await expect(eventClasses.getByRole('row')).toHaveCount(4)

  // remove it again
  await clickRowAction(page, 'probe', 'Remove')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Subscription probe removed')
  await expect(eventClasses.getByRole('row')).toHaveCount(3)

  // secrets card
  const secrets = page.getByRole('table', { name: 'Secrets' })
  await expect(secrets.getByRole('row')).toHaveCount(3) // header + 2

  // newest first
  await expect(secrets.getByRole('row').nth(1)).toContainText('b15f4584')
  await expect(secrets.getByRole('row').nth(2)).toContainText('88c7b9bb')

  // add a secret
  await page.getByRole('button', { name: 'Add secret' }).click()
  const secretModal = page.getByRole('dialog', { name: 'Add secret' })
  await secretModal.getByRole('textbox', { name: 'Secret' }).fill('another-secret')
  await secretModal.getByRole('button', { name: 'Add' }).click()
  await expectToast(page, 'Secret added')
  await expect(secrets.getByRole('row')).toHaveCount(4)
  // the new secret sorts above the seeded ones
  await expect(secrets.getByRole('row').nth(1)).not.toContainText('b15f4584')

  // delete one of the seeded secrets
  await clickRowAction(page, '88c7b9bb-fa79-4516-8f12-abebd2626062', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Secret removed')
  await expect(secrets.getByRole('row')).toHaveCount(3)

  // deleting down to one secret warns that payloads will be unverifiable
  await clickRowAction(page, 'b15f4584-98f1-4cac-b0d3-67294e41aab7', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Secret removed')
  const remainingRow = secrets.getByRole('row').nth(1)
  await remainingRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await expect(page.getByText('This is the only secret on this receiver')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
})

test('Testing tab: probe result and signature format', async ({ page }) => {
  await page.goto('/system/alerts/webhook-1')
  await page.getByRole('tab', { name: 'Testing' }).click()

  const panel = page.getByRole('tabpanel')
  await expect(
    panel.getByText('Send a liveness probe to see the result here')
  ).toBeVisible()

  await panel.getByRole('button', { name: 'Send liveness probe' }).click()
  const probeModal = page.getByRole('dialog', { name: 'Send liveness probe' })
  await probeModal.getByRole('button', { name: 'Send probe' }).click()

  await expect(panel.getByText('Succeeded')).toBeVisible()
  await expect(panel.getByText('200')).toBeVisible()
  await expect(panel.getByText('123ms')).toBeVisible()

  // signature format docs
  await expect(panel.getByText('a={algorithm}&id={secret-id}&s={signature}')).toBeVisible()
  await expect(panel.getByText('The HMAC signature of the request body')).toBeVisible()
})

test('Testing tab: probe failure', async ({ page }) => {
  await page.goto('/system/alerts')

  // the mock backend fails probes for endpoints containing 'unreachable'
  await clickRowAction(page, 'power-mon', 'Edit')
  await page
    .getByRole('dialog', { name: 'Edit webhook' })
    .getByRole('textbox', { name: 'Endpoint URL' })
    .fill('https://unreachable.example.com')
  await page.getByRole('button', { name: 'Update webhook' }).click()
  await expectToast(page, 'Webhook power-mon updated')

  await page.getByRole('tab', { name: 'Testing' }).click()
  const panel = page.getByRole('tabpanel')
  await panel.getByRole('button', { name: 'Send liveness probe' }).click()
  await page
    .getByRole('dialog', { name: 'Send liveness probe' })
    .getByRole('button', { name: 'Send probe' })
    .click()

  await expect(panel.getByText('Unreachable')).toBeVisible()
})

test('Webhook edit', async ({ page }) => {
  await page.goto('/system/alerts')
  await clickRowAction(page, 'general-sys-webhook', 'Edit')

  const modal = page.getByRole('dialog', { name: 'Edit webhook' })
  await expect(modal.getByRole('textbox', { name: 'Endpoint URL' })).toHaveValue(
    'https://api.example.dev/hooks/oxide'
  )
  await modal.getByRole('textbox', { name: 'Name' }).fill('general-webhook')
  await modal
    .getByRole('textbox', { name: 'Endpoint URL' })
    .fill('https://hooks.example.dev')
  await page.getByRole('button', { name: 'Update webhook' }).click()

  await expectToast(page, 'Webhook general-webhook updated')
  // lands on the detail page for the new name
  await expect(page).toHaveURL('/system/alerts/general-webhook')
  await expect(page.getByText('https://hooks.example.dev')).toBeVisible()
})

// The mock backend retries a pending delivery 5s after the list is first
// fetched, so refresh until the state settles rather than sleeping.
const refreshUntil = (page: Page, expectation: () => Promise<void>) =>
  expect(async () => {
    await page.getByRole('button', { name: 'Refresh data' }).click()
    await expectation()
  }).toPass({ timeout: 30_000 })

test('Pending delivery resolves to delivered', async ({ page }) => {
  await page.goto('/system/alerts/webhook-1?tab=deliveries')

  const row = page.getByRole('row', { name: /a3d830ee/ })
  await expect(row.getByText('pending')).toBeVisible()

  await refreshUntil(page, () =>
    expect(row.getByText('delivered')).toBeVisible({ timeout: 1000 })
  )

  // the retry shows up as a second attempt on the delivery
  await clickRowAction(page, 'a3d830ee-a590-40df-8281-42282c056196', 'View details')
  const sideModal = page.getByRole('dialog', { name: 'Webhook delivery' })
  await expect(sideModal.getByRole('table').getByRole('row')).toHaveCount(3) // header + 2
})

test('Pending delivery fails after exhausting retries', async ({ page }) => {
  await page.goto('/system/alerts')

  // the mock backend fails delivery to endpoints containing 'unreachable'
  await clickRowAction(page, 'webhook-1', 'Edit')
  await page
    .getByRole('dialog', { name: 'Edit webhook' })
    .getByRole('textbox', { name: 'Endpoint URL' })
    .fill('https://unreachable.example.com')
  await page.getByRole('button', { name: 'Update webhook' }).click()
  await expectToast(page, 'Webhook webhook-1 updated')

  await page.getByRole('tab', { name: 'Deliveries' }).click()
  const row = page.getByRole('row', { name: /a3d830ee/ })
  await expect(row.getByText('pending')).toBeVisible()

  // one attempt already failed, so it takes two more to hit the 3-attempt limit
  await refreshUntil(page, () =>
    expect(row.getByText('failed')).toBeVisible({ timeout: 1000 })
  )
})

test('Webhook deliveries', async ({ page }) => {
  await page.goto('/system/alerts/webhook-1')
  await page.getByRole('tab', { name: 'Deliveries' }).click()

  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(7) // header + 6

  await expectRowVisible(table, {
    'Event class': 'probe',
    state: 'delivered',
    trigger: 'probe',
  })
  await expectRowVisible(table, {
    'Event class': 'hardware.power_shelf.psu.insert',
    state: 'failed',
    trigger: 'alert',
  })

  // filter by state
  await selectOption(page, 'Filter by state', 'Failed')
  await expect(table.getByRole('row')).toHaveCount(3) // header + 2 failed
  await selectOption(page, 'Filter by state', 'All states')
  await expect(table.getByRole('row')).toHaveCount(7)

  // delivery detail side modal shows attempts
  await clickRowAction(page, '30ece63e-5efd-4365-99a6-d4f09dfa685e', 'View details')
  const sideModal = page.getByRole('dialog', { name: 'Webhook delivery' })
  const attempts = sideModal.getByRole('table')
  await expect(attempts.getByRole('row')).toHaveCount(4) // header + 3 attempts
  await expect(attempts.getByRole('cell', { name: 'HTTP error' })).toBeVisible()

  // request tab reconstructs the payload and headers from the delivery
  await sideModal.getByRole('tab', { name: 'Request' }).click()
  await expect(attempts).toBeHidden()
  const request = sideModal.getByRole('tabpanel')
  await expect(
    request.getByText('"id": "30ece63e-5efd-4365-99a6-d4f09dfa685e"')
  ).toBeVisible()
  await expect(request.getByText('"data": <alert data>')).toBeVisible()
  await expect(request.getByText('x-oxide-alert-class')).toBeVisible()
  await expect(
    request.getByText('hardware.power_shelf.psu.insert', { exact: true })
  ).toBeVisible()

  await sideModal.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()

  // resend a failed delivery requires confirmation, then creates a new
  // pending delivery
  await clickRowAction(page, '30ece63e-5efd-4365-99a6-d4f09dfa685e', 'Resend')
  const confirmModal = page.getByRole('dialog', { name: 'Confirm resend' })
  // the alert ID, truncated in the modal
  await expect(confirmModal.getByText(/beef336d/)).toBeVisible()
  await confirmModal.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Delivery resend started')
  await expect(table.getByRole('row')).toHaveCount(8)
  await expectRowVisible(table, {
    'Event class': 'hardware.power_shelf.psu.insert',
    state: 'pending',
    trigger: 'resend',
  })

  // probes can't be resent
  await clickRowActions(page, '9bbdf44f-7dac-4cd0-b4c2-3e622c9693ee')
  await expect(page.getByRole('menuitem', { name: 'Resend' })).toBeDisabled()
  await page.keyboard.press('Escape')

  // send a liveness probe from the testing tab
  await page.getByRole('tab', { name: 'Testing' }).click()
  await page.getByRole('button', { name: 'Send liveness probe' }).click()
  const probeModal = page.getByRole('dialog', { name: 'Send liveness probe' })
  await probeModal.getByRole('button', { name: 'Send probe' }).click()
  const panel = page.getByRole('tabpanel')
  await expect(panel.getByText('Succeeded')).toBeVisible()
  // the modal has no resend option, so nothing gets resent
  await expect(panel.getByText('resent')).toBeHidden()

  await page.getByRole('tab', { name: 'Deliveries' }).click()
  // 8 rows + the probe. no resends: the probe modal doesn't offer them
  await expect(table.getByRole('row')).toHaveCount(9)
})

test('Webhook delete', async ({ page }) => {
  await page.goto('/system/alerts')

  await clickRowAction(page, 'power-mon', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Webhook power-mon deleted')

  await expect(page.getByRole('cell', { name: 'power-mon' })).toBeHidden()
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(3) // header + 2
})
