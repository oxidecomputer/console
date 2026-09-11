/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { alerts } from '@oxide/api-mocks'

import {
  clickRowAction,
  clickRowActions,
  expectRowVisible,
  expectToast,
  getPageAsUser,
  selectOption,
} from './utils'

test('Alerting nav and tabs', async ({ page }) => {
  const sidebar = page.getByRole('navigation', { name: 'Sidebar navigation' })

  await page.goto('/system/silos')
  await sidebar.getByRole('link', { name: 'Alerting' }).click()

  // the section root redirects to the first tab
  await expect(page).toHaveURL('/system/alerting/receivers')
  await expect(page).toHaveTitle('Receivers / Alerting / Oxide Console')
  await expect(page.getByRole('tab', { name: 'Receivers' })).toHaveAttribute(
    'aria-selected',
    'true'
  )

  await page.getByRole('tab', { name: 'Alerts' }).click()
  await expect(page).toHaveURL('/system/alerting/alerts')
  await expect(page).toHaveTitle('Alerts / Alerting / Oxide Console')
  // nav item stays highlighted on both tabs
  await expect(sidebar.getByRole('link', { name: 'Alerting' })).toHaveAttribute(
    'aria-current',
    'page'
  )
})

test('Alert receivers list', async ({ page }) => {
  await page.goto('/system/alerting/receivers')
  await expect(page).toHaveTitle('Receivers / Alerting / Oxide Console')
  await expect(page.getByRole('heading', { name: 'Alerting' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Receivers' })).toHaveAttribute(
    'aria-selected',
    'true'
  )

  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(4) // header + 3 receivers

  await expectRowVisible(table, {
    name: 'webhook-1',
    Subscriptions: 'hardware.power_shelf.psu.insert+1',
    description: 'Main web deployments',
  })
  await expectRowVisible(table, { name: 'power-mon', Subscriptions: 'hardware.**' })
  await expectRowVisible(table, { name: 'general-sys-webhook', Subscriptions: '—' })
})

test('Webhook receiver create', async ({ page }) => {
  await page.goto('/system/alerting/receivers')

  await page.getByRole('link', { name: 'New receiver' }).click()
  await expect(page).toHaveURL('/system/alerting/receivers-new')

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
  // and no longer than the database column holding it
  await page
    .getByRole('textbox', { name: 'Endpoint URL' })
    .fill(`https://ci.example.com/${'a'.repeat(512)}`)
  await page.getByRole('button', { name: 'Create webhook receiver' }).click()
  await expect(main.getByText('Must be at most 512 characters')).toBeVisible()
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

  // The form is otherwise valid: Enter must commit an exact class without
  // submitting. Leave the glob uncommitted to exercise blur during submission.
  const subsInput = page.getByRole('combobox', { name: 'Alert subscriptions' })
  await subsInput.fill('hardware.power_shelf.psu.insert')
  await subsInput.press('Enter')
  await expect(
    page.getByRole('button', {
      name: 'remove subscription hardware.power_shelf.psu.insert',
    })
  ).toBeVisible()
  await expect(subsInput).toHaveValue('')
  await expect(page).toHaveURL('/system/alerting/receivers-new')

  await subsInput.fill('system.**')
  await page.getByRole('button', { name: 'Create webhook receiver' }).click()
  await expectToast(page, 'Webhook receiver deploy-hook created')

  await expectRowVisible(page.getByRole('table'), {
    name: 'deploy-hook',
    Subscriptions: 'hardware.power_shelf.psu.insert+1',
    description: 'CI deploys',
  })
  await page.getByRole('link', { name: 'deploy-hook', exact: true }).click()
  const subscriptions = page.getByRole('table', { name: 'Alert classes' })
  await expect(subscriptions.getByRole('row')).toHaveCount(3) // header + 2
  await expect(
    subscriptions.getByRole('cell', {
      name: 'hardware.power_shelf.psu.insert',
      exact: true,
    })
  ).toBeVisible()
  await expect(
    subscriptions.getByRole('cell', { name: 'system.**', exact: true })
  ).toBeVisible()
})

test('Webhook receiver create: select subscriptions from dropdown', async ({ page }) => {
  await page.goto('/system/alerting/receivers-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('picker-hook')
  await page.getByRole('textbox', { name: 'Endpoint URL' }).fill('https://ci.example.com')
  await page.getByRole('textbox', { name: 'Secret' }).fill('super-secret')
  await page.getByRole('button', { name: 'Add secret' }).click()

  // This exercises fetched alert classes in the real form; component tests seed
  // the query cache and cannot catch a mismatch in that setup.
  const input = page.getByRole('combobox', { name: 'Alert subscriptions' })
  await input.fill('update')
  const options = page.getByRole('listbox').getByRole('option')
  await options.filter({ hasText: 'system.update.start' }).click()
  await options.filter({ hasText: 'system.update.complete' }).click()
  await page
    .getByRole('button', { name: 'remove subscription system.update.complete' })
    .click()

  // Submitting with a filter still in the input should save only the remaining
  // selection, without the removed chip or the uncommitted filter text.
  await input.fill('update')
  await page.getByRole('button', { name: 'Create webhook receiver' }).click()
  await expectToast(page, 'Webhook receiver picker-hook created')
  await expectRowVisible(page.getByRole('table'), {
    name: 'picker-hook',
    Subscriptions: 'system.update.start',
  })
  await page.getByRole('link', { name: 'picker-hook', exact: true }).click()
  const subscriptions = page.getByRole('table', { name: 'Alert classes' })
  await expect(subscriptions.getByRole('row')).toHaveCount(2) // header + 1
  await expect(
    subscriptions.getByRole('cell', { name: 'system.update.start', exact: true })
  ).toBeVisible()
})

test('Webhook receiver create: API 400', async ({ page }) => {
  await page.goto('/system/alerting/receivers-new')
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('webhook-1')
  await page
    .getByRole('textbox', { name: 'Endpoint URL' })
    .fill('https://recovery.example.com')
  await page.getByRole('textbox', { name: 'Secret' }).fill('keep-this-secret')
  await page.getByRole('button', { name: 'Add secret' }).click()
  await page.getByRole('button', { name: 'Create webhook receiver' }).click()

  // A duplicate name exercises a real API failure, after client validation.
  await expect(page.getByText('Webhook receiver name already exists')).toBeVisible()
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('recovered-hook')
  await page.getByRole('button', { name: 'Create webhook receiver' }).click()
  await expectToast(page, 'Webhook receiver recovered-hook created')

  // Subscriptions are optional. A newly created receiver starts with empty
  // subscription and delivery views.
  await page.getByRole('link', { name: 'recovered-hook', exact: true }).click()
  await expect(page.getByText('https://recovery.example.com')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No subscriptions' })).toBeVisible()
  await expect(page.getByRole('table', { name: 'Secrets' }).getByRole('row')).toHaveCount(2)
  await page.getByRole('tab', { name: 'Deliveries' }).click()
  await expect(page.getByRole('heading', { name: 'No deliveries' })).toBeVisible()
})

test('Webhook receiver delete: API 403', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Jane Austen')
  await page.goto('/system/alerting/receivers')
  await expect(page.getByRole('link', { name: 'power-mon', exact: true })).toBeVisible()
  await clickRowAction(page, 'power-mon', 'Delete')
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expectToast(page, 'Action not authorized')
  await expect(page.getByRole('link', { name: 'power-mon', exact: true })).toBeVisible()
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(4)
})

test('Webhook receiver detail: properties, subscriptions, secrets', async ({ page }) => {
  await page.goto('/system/alerting/receivers')
  await page.getByRole('link', { name: 'webhook-1' }).click()
  await expect(page).toHaveURL('/system/alerting/receivers/webhook-1')

  await expect(page.getByRole('heading', { name: 'webhook-1' })).toBeVisible()
  await expect(page.getByText('https://fma.corp.oxide.computer')).toBeVisible()
  await expect(page.getByText('Main web deployments')).toBeVisible()

  // subscriptions card
  const subscriptions = page.getByRole('table', { name: 'Alert classes' })
  await expect(subscriptions.getByRole('row')).toHaveCount(3) // header + 2

  // add a subscription
  await page.getByRole('button', { name: 'Add subscription' }).click()
  const addModal = page.getByRole('dialog', { name: 'Add subscription' })
  await addModal
    .getByRole('combobox', { name: 'Subscription' })
    .fill('hardware.sensor.overtemp')
  await page.getByRole('option', { name: 'hardware.sensor.overtemp' }).click()
  await addModal.getByRole('button', { name: 'Add' }).click()
  await expectToast(page, 'Subscribed to hardware.sensor.overtemp')
  await expect(subscriptions.getByRole('row')).toHaveCount(4)

  // remove it again
  await clickRowAction(page, 'hardware.sensor.overtemp', 'Remove')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Subscription hardware.sensor.overtemp removed')
  await expect(subscriptions.getByRole('row')).toHaveCount(3)

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

  // deleting the last secret warns that deliveries will stop
  await clickRowAction(page, 'b15f4584-98f1-4cac-b0d3-67294e41aab7', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Secret removed')
  const remainingRow = secrets.getByRole('row').nth(1)
  await remainingRow.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await expect(page.getByText('Deleting the only secret stops deliveries')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
})

test('Add subscription modal previews the classes a glob matches', async ({ page }) => {
  await page.goto('/system/alerting/receivers/webhook-1')

  await page.getByRole('button', { name: 'Add subscription' }).click()
  const modal = page.getByRole('dialog', { name: 'Add subscription' })
  const input = modal.getByRole('combobox', { name: 'Subscription' })
  const preview = modal.getByText(/Matches \d+ alert class/)

  // an exact class only ever matches itself, so there is nothing to preview
  await input.fill('hardware.sled.fault')
  await expect(preview).toBeHidden()

  await input.fill('hardware.**')
  await expect(preview).toHaveText(/^Matches 11 alert classes:/)
  await expect(preview).toContainText('hardware.sensor.overtemp')
  await expect(preview).not.toContainText('system.update.start')

  // ** matches every class except the synthetic probe class, which can't be
  // subscribed to
  await input.fill('**')
  await expect(preview).toHaveText(/^Matches 14 alert classes:/)
  await expect(preview).not.toContainText('probe')

  // a well-formed glob matching nothing says so rather than rendering an
  // empty list
  await input.fill('zzz.**')
  await expect(preview).toBeHidden()
  await expect(modal.getByText('No current alert classes match this pattern')).toBeVisible()

  // an exact class the API doesn't know is rejected before submit
  await input.fill('hardware.sled.nope')
  await modal.getByRole('button', { name: 'Add' }).click()
  await expect(modal.getByText('Not an alert class')).toBeVisible()
})

test('Add subscription modal omits classes an existing glob already covers', async ({
  page,
}) => {
  // power-mon subscribes to hardware.**, so only non-hardware classes are offered
  await page.goto('/system/alerting/receivers/power-mon')
  await page.getByRole('button', { name: 'Add subscription' }).click()
  const modal = page.getByRole('dialog', { name: 'Add subscription' })
  await modal.getByRole('combobox', { name: 'Subscription' }).click()
  await expect(page.getByRole('option', { name: /system\.update\.start/ })).toBeVisible()
  await expect(page.getByRole('option', { name: /hardware\.sled\.fault/ })).toBeHidden()
})

test('Testing tab: probe result and signature format', async ({ page }) => {
  await page.goto('/system/alerting/receivers/webhook-1')
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

test('Testing tab: no deliveries hides resend option', async ({ page }) => {
  await page.goto('/system/alerting/receivers/general-sys-webhook?tab=testing')

  const panel = page.getByRole('tabpanel')
  await panel.getByRole('button', { name: 'Send liveness probe' }).click()
  const modal = page.getByRole('dialog', { name: 'Send liveness probe' })
  await expect(
    modal.getByRole('checkbox', { name: 'Resend failed deliveries if the probe succeeds' })
  ).toBeHidden()
  await expect(modal.getByText('Every alert so far has reached this endpoint')).toBeHidden()

  await modal.getByRole('button', { name: 'Send probe' }).click()
  await expect(panel.getByText('Succeeded')).toBeVisible()
})

test('Webhook receiver edit', async ({ page }) => {
  await page.goto('/system/alerting/receivers')
  await clickRowAction(page, 'general-sys-webhook', 'Edit')

  const modal = page.getByRole('dialog', { name: 'Edit webhook receiver' })
  await expect(modal.getByRole('textbox', { name: 'Endpoint URL' })).toHaveValue(
    'https://api.example.dev/hooks/oxide'
  )
  await modal.getByRole('textbox', { name: 'Name' }).fill('general-webhook')
  await modal
    .getByRole('textbox', { name: 'Endpoint URL' })
    .fill('https://hooks.example.dev')
  await page.getByRole('button', { name: 'Update webhook receiver' }).click()

  await expectToast(page, 'Webhook receiver general-webhook updated')
  // lands on the detail page for the new name
  await expect(page).toHaveURL('/system/alerting/receivers/general-webhook')
  await expect(page.getByText('https://hooks.example.dev')).toBeVisible()
})

test('Webhook receiver deliveries: list and filter', async ({ page }) => {
  await page.goto('/system/alerting/receivers/webhook-1')
  await page.getByRole('tab', { name: 'Deliveries' }).click()

  const table = page.getByRole('table')
  // header + 6. the seeded probe delivery is excluded: the API never lists
  // probe-triggered deliveries
  await expect(table.getByRole('row')).toHaveCount(7)
  await expect(table.getByText('9bbdf44f-7dac-4cd0-b4c2-3e622c9693ee')).toBeHidden()

  // a pending delivery is already being retried, so it can't be resent
  await clickRowActions(page, 'a3d830ee-a590-40df-8281-42282c056196')
  await expect(page.getByRole('menuitem', { name: 'Resend' })).toBeDisabled()
  await page.keyboard.press('Escape')

  // Truncate renders the full ID (invisible, for stable layout) alongside the
  // ellipsized copy, so cell text contains both. Match on the full value.
  await expectRowVisible(table, {
    'Delivery ID': expect.stringContaining('30ece63e-5efd-4365-99a6-d4f09dfa685e'),
    'Alert ID': expect.stringContaining('beef336d-99db-4b12-ac08-7ebcaab8421a'),
    'Alert class': 'hardware.power_shelf.psu.insert',
    state: 'failed',
    trigger: 'alert',
  })
  // the untruncated ID is still the row's accessible name, so it stays findable
  await expect(
    table.getByRole('row', { name: '30ece63e-5efd-4365-99a6-d4f09dfa685e' })
  ).toBeVisible()

  // filter by state
  await selectOption(page, 'Filter by state', 'Failed')
  await expect(table.getByRole('row')).toHaveCount(4) // header + 3 failed
  await selectOption(page, 'Filter by state', 'All states')
  await expect(table.getByRole('row')).toHaveCount(7)
})

test('Webhook receiver deliveries: detail side modal', async ({ page }) => {
  await page.goto('/system/alerting/receivers/webhook-1?tab=deliveries')

  // the side modal shows the delivery properties and each attempt
  await clickRowAction(page, '30ece63e-5efd-4365-99a6-d4f09dfa685e', 'View details')
  const sideModal = page.getByRole('dialog', { name: 'Webhook delivery' })

  const props = sideModal.getByLabel('Properties table').first()
  await expect(props).toContainText('Started')
  await expect(props).toContainText('Delivery ID')
  await expect(props.getByLabel('30ece63e-5efd-4365-99a6-d4f09dfa685e')).toBeVisible()
  await expect(props).toContainText('Receiver ID')
  await expect(props.getByLabel('ae2d6e09-9f4d-4dd1-ac54-160d61c7ce42')).toBeVisible()
  await expect(props).not.toContainText('Alert ID')

  const attempts = sideModal.getByRole('table')
  await expect(attempts.getByRole('row')).toHaveCount(4) // header + 3 attempts
  await expect(attempts.getByRole('cell', { name: 'HTTP error' })).toBeVisible()

  // alert tab shows the alert record fetched by ID, laid out like the alerts
  // page detail modal
  await sideModal.getByRole('tab', { name: 'Alert' }).click()
  await expect(attempts).toBeHidden()
  const alertPanel = sideModal.getByRole('tabpanel')
  const alertProps = alertPanel.getByLabel('Properties table')
  await expect(alertProps).toContainText('Alert ID')
  await expect(alertProps.getByLabel('beef336d-99db-4b12-ac08-7ebcaab8421a')).toBeVisible()
  await expect(alertProps).toContainText('Class version')
  await expect(alertProps.getByText('0', { exact: true })).toBeVisible()
  const alertBody = alertPanel.locator('pre')
  await expect(alertBody).toContainText('"Murata"')
  // keys are snake_case like the API and the webhook payload, not the
  // camelCase the client uses internally
  await expect(alertBody).toContainText('firmware_revision')
})

test('Webhook receiver deliveries: manual resend then probe', async ({ page }) => {
  await page.goto('/system/alerting/receivers/webhook-1?tab=deliveries')
  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(7) // header + 6

  // resend a failed delivery requires confirmation, then creates a new
  // pending delivery
  await clickRowAction(page, '30ece63e-5efd-4365-99a6-d4f09dfa685e', 'Resend')
  const confirmModal = page.getByRole('dialog', { name: 'Confirm resend' })
  // the alert ID is truncated for display, but keeps the full value as its
  // accessible name
  await expect(
    confirmModal.getByLabel('beef336d-99db-4b12-ac08-7ebcaab8421a')
  ).toBeVisible()
  await confirmModal.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Delivery resend started')
  await expect(table.getByRole('row')).toHaveCount(8)
  await expectRowVisible(table, {
    'Alert class': 'hardware.power_shelf.psu.insert',
    state: 'pending',
    trigger: 'resend',
  })

  // send a liveness probe from the testing tab, resending failed deliveries
  await page.getByRole('tab', { name: 'Testing' }).click()
  await page.getByRole('button', { name: 'Send liveness probe' }).click()
  const probeModal = page.getByRole('dialog', { name: 'Send liveness probe' })
  // the preview already accounts for the manual resend above, so it says one,
  // not one per failed record
  await expect(probeModal.getByText('1 alert would be resent')).toBeVisible()
  await probeModal
    .getByRole('checkbox', { name: 'Resend failed deliveries if the probe succeeds' })
    .check()
  await probeModal.getByRole('button', { name: 'Send probe' }).click()
  const panel = page.getByRole('tabpanel')
  await expect(panel.getByText('Succeeded')).toBeVisible()
  // resends are counted per alert, not per failed delivery record. of the three
  // failed records, 8c8a74ba already has a successful resend and beef336d was
  // just resent by hand, so only 81dd4626 is left
  await expect(panel.getByText('1 delivery requeued')).toBeVisible()

  // the result links to the deliveries tab, where the resends resolve
  await panel.getByRole('link', { name: 'View deliveries' }).click()
  // 8 rows + the one resend. the probe itself is not listed
  await expect(table.getByRole('row')).toHaveCount(9)
})

// The bug that got this checkbox removed the first time: the mock resent every
// delivery record in the failed state, so already-resent alerts were requeued on
// every probe and the count never dropped.
test('Testing tab: probe resends and preview update', async ({ page }) => {
  await page.goto('/system/alerting/receivers/webhook-1?tab=testing')

  const panel = page.getByRole('tabpanel')
  // the modal previews how many alerts a resend would requeue, so the user can
  // see the number before committing to the checkbox
  const openProbeModal = async (expectedNote: string) => {
    await panel.getByRole('button', { name: 'Send liveness probe' }).click()
    const modal = page.getByRole('dialog', { name: 'Send liveness probe' })
    await expect(modal.getByText(expectedNote)).toBeVisible()
    return modal
  }
  const sendProbe = async (resend: boolean, expectedNote: string) => {
    const modal = await openProbeModal(expectedNote)
    if (resend) {
      await modal
        .getByRole('checkbox', { name: 'Resend failed deliveries if the probe succeeds' })
        .check()
    }
    await modal.getByRole('button', { name: 'Send probe' }).click()
    await expect(panel.getByText('Succeeded')).toBeVisible()
  }

  // beef336d and 81dd4626 have only ever failed. 8c8a74ba also has a failed
  // record, but it already has a successful resend, so it does not count
  const twoWaiting = '2 alerts would be resent'

  // leaving the box unchecked resends nothing, even though 2 are waiting
  await sendProbe(false, twoWaiting)
  await expect(panel.getByText('requeued')).toBeHidden()
  await expect(panel.getByText('No failed deliveries to resend')).toBeHidden()

  // the preview matches what the probe actually reports
  await sendProbe(true, twoWaiting)
  await expect(panel.getByText('2 deliveries requeued')).toBeVisible()

  // the resends are still pending, but a pending delivery already counts as
  // settled, so the preview drops to zero and disables resending without
  // waiting for them to land
  const modal = await openProbeModal('Every alert so far has reached this endpoint')
  const resendBox = modal.getByRole('checkbox', {
    name: 'Resend failed deliveries if the probe succeeds',
  })
  await expect(resendBox).toBeDisabled()
  await expect(resendBox).not.toBeChecked()

  // the probe still works, it just doesn't ask for resends
  await modal.getByRole('button', { name: 'Send probe' }).click()
  await expect(panel.getByText('Succeeded')).toBeVisible()
  await expect(panel.getByText('requeued')).toBeHidden()
  await expect(panel.getByText('No failed deliveries to resend')).toBeHidden()
})

test('Testing tab: failed probe with resends requested', async ({ page }) => {
  await page.goto('/system/alerting/receivers')

  // the mock backend fails probes for endpoints containing 'unreachable'
  await clickRowAction(page, 'webhook-1', 'Edit')
  await page
    .getByRole('dialog', { name: 'Edit webhook receiver' })
    .getByRole('textbox', { name: 'Endpoint URL' })
    .fill('https://unreachable.example.com')
  await page.getByRole('button', { name: 'Update webhook receiver' }).click()
  await expectToast(page, 'Webhook receiver webhook-1 updated')

  await page.getByRole('tab', { name: 'Testing' }).click()
  const panel = page.getByRole('tabpanel')
  await panel.getByRole('button', { name: 'Send liveness probe' }).click()
  const modal = page.getByRole('dialog', { name: 'Send liveness probe' })
  await modal
    .getByRole('checkbox', { name: 'Resend failed deliveries if the probe succeeds' })
    .check()
  await modal.getByRole('button', { name: 'Send probe' }).click()

  // resends only happen on success, so the API returns null and we show no row
  await expect(panel.getByText('Unreachable')).toBeVisible()
  await expect(panel.getByText('requeued')).toBeHidden()
  await expect(panel.getByText('No failed deliveries to resend')).toBeHidden()
})

test('Resend fails for an unsubscribed alert class', async ({ page }) => {
  await page.goto('/system/alerting/receivers/webhook-1')

  // unsubscribe from the class of an existing failed delivery
  await clickRowAction(page, 'hardware.power_shelf.psu.insert', 'Remove')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Subscription hardware.power_shelf.psu.insert removed')

  // resending a delivery of that class is rejected, matching the real API
  await page.getByRole('tab', { name: 'Deliveries' }).click()
  await clickRowAction(page, '30ece63e-5efd-4365-99a6-d4f09dfa685e', 'Resend')
  await page
    .getByRole('dialog', { name: 'Confirm resend' })
    .getByRole('button', { name: 'Confirm' })
    .click()
  await expectToast(
    page,
    "Could not resend alertCannot resend alert: receiver is not subscribed to the 'hardware.power_shelf.psu.insert' alert class"
  )
  // the rejected resend must not have created a new delivery
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(7) // header + 6
})

test('Webhook receiver delete', async ({ page }) => {
  await page.goto('/system/alerting/receivers')

  await clickRowAction(page, 'power-mon', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'Webhook receiver power-mon deleted')

  await expect(page.getByRole('cell', { name: 'power-mon' })).toBeHidden()
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(3) // header + 2
})

test('Alert list basics', async ({ page }) => {
  await page.goto('/system/alerting/alerts')

  await expect(page).toHaveTitle('Alerts / Alerting / Oxide Console')
  await expect(page.getByRole('heading', { name: 'Alerting' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Alerts' })).toHaveAttribute(
    'aria-selected',
    'true'
  )

  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(
    alerts.filter((a) => a.class !== 'probe').length + 1
  )

  // rows show the ID, class, and a one-line preview of the payload
  await expectRowVisible(table, {
    'Alert ID': expect.stringContaining('26cb0726'),
    'Alert class': 'hardware.power_shelf.psu.insert',
    Payload: expect.stringContaining('rack_id'),
  })
  await expectRowVisible(table, {
    'Alert ID': expect.stringContaining('8c8a74ba'),
    'Alert class': 'hardware.power_shelf.psu.remove',
  })

  // alert classes must stay lowercase so they can be copied into a subscription
  await expect(table.getByText('hardware.power_shelf.psu.insert').first()).toHaveCSS(
    'text-transform',
    'none'
  )
})

test('Alert list detail view', async ({ page }) => {
  await page.goto('/system/alerting/alerts')

  const rows = page.getByRole('table').getByRole('row')

  // the whole row opens the details
  await rows.filter({ hasText: '26cb0726' }).click()
  const modal = page.getByRole('dialog', { name: 'Alert details' })
  await expect(modal).toBeVisible()
  const alertBody = modal.locator('pre')
  await expect(alertBody).toContainText('"Murata"')
  await expect(alertBody).toContainText('slot: 0')
  await modal.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click()
  await expect(modal).toBeHidden()

  // keyboard users have a hidden button per row
  await rows
    .filter({ hasText: '0d38abba' })
    .getByRole('button', { name: 'View alert details' })
    .focus()
  await page.keyboard.press('Enter')
  await expect(modal).toBeVisible()
  await expect(modal.locator('pre')).toContainText('slot: 3')
})
