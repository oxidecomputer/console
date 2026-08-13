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
  await expect(page.getByRole('heading', { name: 'Alert Receivers' })).toBeVisible()

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

  await expect(page.getByRole('heading', { name: 'Create webhook receiver' })).toBeVisible()

  // scope text assertions to main to avoid matching the aria-live announcer,
  // which repeats validation error messages at the body level
  const main = page.getByRole('main')

  await page.getByRole('textbox', { name: 'Name' }).fill('deploy-hook')
  await page.getByRole('textbox', { name: 'Description' }).fill('CI deploys')

  // endpoint must be a valid URL
  await page.getByRole('textbox', { name: 'Endpoint URL' }).fill('not-a-url')
  await page.getByRole('button', { name: 'Create webhook receiver' }).click()
  await expect(
    main.getByText('Must be a valid URL, including the scheme (e.g., https://)')
  ).toBeVisible()
  // at least one secret is required
  await expect(main.getByText('At least one secret is required')).toBeVisible()
  await page.getByRole('textbox', { name: 'Endpoint URL' }).fill('https://ci.example.com')

  // add a secret; it lands in the mini table
  await page.getByRole('textbox', { name: 'Secret' }).fill('super-secret')
  await page.getByRole('button', { name: 'Add secret' }).click()
  await expect(
    page
      .getByRole('table', { name: 'Secrets' })
      .getByRole('cell', { name: 'super-secret', exact: true })
  ).toBeVisible()
  await expect(main.getByText('At least one secret is required')).toBeHidden()

  // add a subscription: a bad glob is rejected on Enter, a good one becomes a chip
  const subsInput = page.getByRole('combobox', { name: 'Event subscriptions' })
  await subsInput.fill('hardware..bad')
  await subsInput.press('Enter')
  await expect(
    main.getByText('Must be an event class or a glob pattern like hardware.**')
  ).toBeVisible()
  await subsInput.fill('hardware.**')
  await subsInput.press('Enter')
  await expect(
    page.getByRole('button', { name: 'remove subscription hardware.**' })
  ).toBeVisible()
  await expect(subsInput).toHaveValue('')

  await page.getByRole('button', { name: 'Create webhook receiver' }).click()
  await expectToast(page, 'Webhook deploy-hook created')

  await expectRowVisible(page.getByRole('table'), {
    name: 'deploy-hook',
    Events: 'hardware.**',
    description: 'CI deploys',
  })
})

test('Webhook create subscriptions field', async ({ page }) => {
  await page.goto('/system/alerts-new')

  const subsInput = page.getByRole('combobox', { name: 'Event subscriptions' })
  const listbox = page.getByRole('listbox')
  const chipRemove = (sub: string) =>
    page.getByRole('button', { name: `remove subscription ${sub}` })

  // accessible-name matching is brittle here because the highlighted name is
  // split across elements, so filter rows by rendered text instead
  const option = (name: string) => listbox.getByRole('option').filter({ hasText: name })

  // focusing opens the catalog showing all classes
  await subsInput.click()
  await expect(listbox.getByText('All classes')).toBeVisible()
  await expect(listbox.getByRole('option')).toHaveCount(15)

  // a glob query filters the catalog and labels matched rows with the pattern
  await subsInput.fill('hardware.*.fault')
  await expect(listbox.getByText('Matching “hardware.*.fault”')).toBeVisible()
  // 3 classes match; psu.fault is one segment too deep, shown as a near miss
  // labeled with the broader pattern that would cover it
  await expect(listbox.getByText('Showing 4 of 15')).toBeVisible()
  const pendingRow = option('hardware.disk.fault')
  await expect(pendingRow.getByText('hardware.*.fault', { exact: true })).toBeVisible()
  const nearMissRow = option('hardware.power_shelf.psu.fault')
  await expect(nearMissRow.getByText('hardware.**.fault', { exact: true })).toBeVisible()

  // Enter commits the glob as a chip and clears the query
  await subsInput.press('Enter')
  await expect(chipRemove('hardware.*.fault')).toBeVisible()
  await expect(subsInput).toHaveValue('')

  // rows matched by the committed glob are locked and can't be double-added
  await subsInput.fill('fault')
  const coveredRow = option('hardware.disk.fault')
  await expect(coveredRow.getByText('via hardware.*.fault')).toBeVisible()
  await expect(coveredRow).toHaveAttribute('aria-disabled', 'true')
  // force because playwright refuses to click aria-disabled elements; we want
  // to verify the click is a no-op anyway
  await coveredRow.click({ force: true })
  await expect(chipRemove('hardware.disk.fault')).toBeHidden()

  // plain-text filter + ticking rows commits exact classes without resetting the query
  await subsInput.fill('update')
  await expect(listbox.getByText('Showing 3 of 15')).toBeVisible()
  await option('system.update.start').click()
  await option('system.update.complete').click()
  await expect(chipRemove('system.update.start')).toBeVisible()
  await expect(chipRemove('system.update.complete')).toBeVisible()
  await expect(subsInput).toHaveValue('update')
  await expect(listbox).toBeVisible()

  // clicking a picked row unpicks it
  await option('system.update.start').click()
  await expect(chipRemove('system.update.start')).toBeHidden()

  // zero matches shows an explicit empty state with a clear action
  await subsInput.fill('zzz')
  await expect(listbox.getByText('No classes match')).toBeVisible()
  await listbox.getByRole('button', { name: 'Clear' }).click()
  await expect(listbox.getByText('All classes')).toBeVisible()

  // an incomplete glob shows the full catalog, not a bogus empty state
  await subsInput.fill('*.')
  await expect(listbox.getByRole('option')).toHaveCount(15)
  await subsInput.fill('')

  // backspace on an empty query arms the last chip, a second one removes it
  await subsInput.press('Backspace')
  await expect(chipRemove('system.update.complete')).toBeVisible()
  await subsInput.press('Backspace')
  await expect(chipRemove('system.update.complete')).toBeHidden()

  // typing disarms, so the chip survives
  await subsInput.press('Backspace')
  await subsInput.pressSequentially('x')
  await subsInput.press('Backspace')
  await subsInput.press('Backspace')
  await expect(chipRemove('hardware.*.fault')).toBeVisible()

  // arrow keys move the armed selection, so a specific chip can be deleted
  await subsInput.fill('probe')
  await subsInput.press('Enter')
  await expect(chipRemove('probe')).toBeVisible()
  await subsInput.press('ArrowLeft') // arm probe
  await subsInput.press('ArrowLeft') // arm hardware.*.fault
  await subsInput.press('Backspace')
  await expect(chipRemove('hardware.*.fault')).toBeHidden()
  await expect(chipRemove('probe')).toBeVisible()

  // uncommitted text is discarded on blur so it doesn't read as added
  await subsInput.fill('leftover')
  await page.getByRole('textbox', { name: 'Name' }).click()
  await expect(subsInput).toHaveValue('')

  // subscribed classes sort to the top when the panel opens
  await subsInput.click()
  await expect(listbox.getByRole('option').first()).toContainText('probe')
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

  // add a secret
  await page.getByRole('button', { name: 'Add secret' }).click()
  const secretModal = page.getByRole('dialog', { name: 'Add secret' })
  await secretModal.getByRole('textbox', { name: 'Secret' }).fill('another-secret')
  await secretModal.getByRole('button', { name: 'Add' }).click()
  await expectToast(page, 'Secret added')
  await expect(secrets.getByRole('row')).toHaveCount(4)

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

  // send a liveness probe from the testing tab, resending failed deliveries on
  // success
  await page.getByRole('tab', { name: 'Testing' }).click()
  await page.getByRole('button', { name: 'Send liveness probe' }).click()
  const probeModal = page.getByRole('dialog', { name: 'Send liveness probe' })
  await probeModal
    .getByRole('checkbox', { name: 'Resend failed deliveries if the probe succeeds' })
    .click()
  await probeModal.getByRole('button', { name: 'Send probe' }).click()
  await expect(page.getByText('2 failed deliveries resent')).toBeVisible()

  await page.getByRole('tab', { name: 'Deliveries' }).click()
  // 8 rows + 1 probe + 2 resends of the 2 failed deliveries
  await expect(table.getByRole('row')).toHaveCount(11)
  await expectRowVisible(table, {
    'Event class': 'hardware.power_shelf.psu.remove',
    state: 'pending',
    trigger: 'resend',
  })
})

test('Webhook delete', async ({ page }) => {
  await page.goto('/system/alerts')

  await clickRowAction(page, 'power-mon', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Webhook power-mon deleted')

  await expect(page.getByRole('cell', { name: 'power-mon' })).toBeHidden()
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(3) // header + 2
})
