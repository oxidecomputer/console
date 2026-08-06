/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

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

test('Developer tab documents the request format', async ({ page }) => {
  await page.goto('/system/alerts/webhook-1')
  await page.getByRole('tab', { name: 'Developer' }).click()

  const headers = page.getByRole('table', { name: 'Request headers' })
  await expect(headers.getByRole('cell', { name: 'x-oxide-alert-class' })).toBeVisible()
  await expect(
    page.getByRole('cell', { name: 'x-oxide-signature', exact: true })
  ).toBeVisible()
  await expect(page.getByText('HMAC-SHA256')).toBeVisible()
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
  await expect(sideModal.getByText('Attempts')).toBeVisible()
  const attempts = sideModal.getByRole('table')
  await expect(attempts.getByRole('row')).toHaveCount(4) // header + 3 attempts
  await expect(attempts.getByRole('cell', { name: 'HTTP error' })).toBeVisible()
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

  // send a liveness probe from the page actions menu, resending failed
  // deliveries on success
  await page.getByRole('button', { name: 'Webhook actions' }).click()
  await page.getByRole('menuitem', { name: 'Send liveness probe' }).click()
  const probeModal = page.getByRole('dialog', { name: 'Send liveness probe' })
  await probeModal
    .getByRole('checkbox', { name: 'Resend failed deliveries if the probe succeeds' })
    .click()
  await probeModal.getByRole('button', { name: 'Send probe' }).click()
  await expectToast(page, 'Liveness probe delivered')
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
