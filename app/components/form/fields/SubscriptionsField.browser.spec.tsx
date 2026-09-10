/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { commands, userEvent } from 'vitest/browser'

import { api, q } from '@oxide/api'
import { alertClasses } from '@oxide/api-mocks'

import type { WebhookCreateFormValues } from '~/forms/webhook-create'
import { ALL_ISH } from '~/util/consts'

import { SubscriptionsField } from './SubscriptionsField'

function FieldHarness({ subscriptions }: { subscriptions: string[] }) {
  const { control } = useForm<WebhookCreateFormValues>({
    defaultValues: { name: '', description: '', endpoint: '', secrets: [], subscriptions },
  })
  const selected = useWatch({ control, name: 'subscriptions' })

  return (
    <>
      <button type="button">Outside</button>
      <SubscriptionsField control={control} />
      <output aria-label="Selected subscriptions">{JSON.stringify(selected)}</output>
    </>
  )
}

async function renderField(subscriptions: string[] = []) {
  // Seed the catalog only; the field still writes to a real react-hook-form
  // control. Submission and blur-to-submit are covered by the create E2E test.
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  client.setQueryData(q(api.alertClassList, { query: { limit: ALL_ISH } }).queryKey, {
    items: alertClasses,
  })
  // Scope queries to the harness: live announcements outside it repeat error
  // text and otherwise make text locators ambiguous until the announcement expires.
  const { locator: screen } = await render(
    <QueryClientProvider client={client}>
      <FieldHarness subscriptions={subscriptions} />
    </QueryClientProvider>
  )
  const listbox = screen.getByRole('listbox')
  return {
    screen,
    input: screen.getByRole('combobox', { name: 'Alert subscriptions' }),
    listbox,
    // Highlighting splits the class name across elements, so match rendered text.
    option: (name: string) => listbox.getByRole('option').filter({ hasText: name }),
    chipRemove: (name: string) =>
      screen.getByRole('button', { name: `remove subscription ${name}` }),
    values: screen.getByRole('status', { name: 'Selected subscriptions' }),
  }
}

const press = (key: string) => commands.pressComboboxKey('Alert subscriptions', key)

test('opens the catalog and shows glob matches and broader near misses', async () => {
  const { input, listbox, option } = await renderField()
  await input.click()
  await expect.element(listbox.getByText('All classes')).toBeVisible()
  await expect.element(listbox.getByText('Showing 14')).toBeVisible()
  await expect.element(option('probe')).not.toBeInTheDocument()

  await input.fill('hardware.*.fault')
  await expect.element(listbox.getByText('Matching “hardware.*.fault”')).toBeVisible()
  await expect.element(listbox.getByText('Showing 4 of 14')).toBeVisible()
  await expect
    .element(option('hardware.disk.fault').getByText('hardware.*.fault', { exact: true }))
    .toBeVisible()
  await expect
    .element(
      option('hardware.power_shelf.psu.fault').getByText('hardware.**.fault', {
        exact: true,
      })
    )
    .toBeVisible()
})

test.each([
  ['Enter', 'hardware.*.fault'],
  ['Space', 'system.**'],
  ['Space', 'hardware.power_shelf.psu.insert'],
])('commits with %s: %s', async (key, subscription) => {
  const { input, chipRemove, values } = await renderField()
  await input.fill(subscription)
  await press(key)
  await expect.element(chipRemove(subscription)).toBeVisible()
  await expect.element(input).toHaveValue('')
  await expect.element(values).toHaveTextContent(JSON.stringify([subscription]))

  await chipRemove(subscription).click()
  await expect.element(values).toHaveTextContent('[]')
})

test('covered classes cannot be added separately', async () => {
  const { input, option, chipRemove, values } = await renderField(['hardware.*.fault'])
  await input.fill('fault')
  const covered = option('hardware.disk.fault')
  await expect.element(covered.getByText('via hardware.*.fault')).toBeVisible()
  await expect.element(covered).toHaveAttribute('aria-disabled', 'true')
  // Exercise the handler too, even though the option advertises being disabled.
  await covered.click({ force: true })
  await expect.element(chipRemove('hardware.disk.fault')).not.toBeInTheDocument()
  await expect.element(values).toHaveTextContent('["hardware.*.fault"]')
})

test('Space ignores partial class names and Enter rejects them', async () => {
  const { screen, input, chipRemove, values } = await renderField()
  await input.fill('update')
  await press('Space')
  await expect.element(input).toHaveValue('update')
  await expect.element(chipRemove('update')).not.toBeInTheDocument()

  await press('Enter')
  await expect
    .element(screen.getByText('Not an alert class', { exact: false }))
    .toBeVisible()
  await expect.element(input).toHaveValue('update')
  await expect.element(values).toHaveTextContent('[]')
})

test.each([
  ['hardware..bad', 'Must be an alert class or a glob pattern'],
  ['probe', 'The probe class is only used for liveness probes'],
])('rejects %s without changing subscriptions', async (value, error) => {
  const { screen, input, values } = await renderField()
  await input.fill(value)
  await press('Enter')
  await expect.element(screen.getByText(error, { exact: false })).toBeVisible()
  await expect.element(values).toHaveTextContent('[]')
})

test('picks multiple classes without clearing the filter and unpicks a selected row', async () => {
  const { input, listbox, option, chipRemove, values } = await renderField()
  await input.fill('update')
  await expect.element(listbox.getByText('Showing 3 of 14')).toBeVisible()
  await option('system.update.start').click()
  await option('system.update.complete').click()
  await expect.element(chipRemove('system.update.start')).toBeVisible()
  await expect.element(chipRemove('system.update.complete')).toBeVisible()
  await expect.element(input).toHaveValue('update')
  await expect.element(listbox).toBeVisible()
  await expect
    .element(values)
    .toHaveTextContent('["system.update.start","system.update.complete"]')

  await option('system.update.start').click()
  await expect.element(chipRemove('system.update.start')).not.toBeInTheDocument()
  await expect.element(values).toHaveTextContent('["system.update.complete"]')
})

test('clears an empty search and keeps the catalog visible for an incomplete glob', async () => {
  const { input, listbox } = await renderField()
  await input.fill('zzz')
  await expect.element(listbox.getByText('No classes match')).toBeVisible()
  await listbox.getByRole('button', { name: 'Clear' }).click()
  await expect.element(input).toHaveValue('')
  await expect.element(listbox.getByText('All classes')).toBeVisible()

  await input.fill('*.')
  await expect.element(listbox.getByText('Showing 14 of 14')).toBeVisible()
})

test('Backspace arms the last chip before removing it', async () => {
  const { input, chipRemove, values } = await renderField([
    'hardware.*.fault',
    'system.update.complete',
  ])
  await input.click()
  await press('Backspace')
  await expect.element(chipRemove('system.update.complete')).toBeVisible()
  await expect
    .element(values)
    .toHaveTextContent('["hardware.*.fault","system.update.complete"]')
  await press('Backspace')
  await expect.element(chipRemove('system.update.complete')).not.toBeInTheDocument()
  await expect.element(values).toHaveTextContent('["hardware.*.fault"]')
})

test('typing disarms a chip so subsequent Backspace edits the query', async () => {
  const { input, chipRemove, values } = await renderField(['hardware.*.fault'])
  await input.click()
  await press('Backspace')
  await userEvent.keyboard('x')
  await press('Backspace')
  await press('Backspace')
  await expect.element(chipRemove('hardware.*.fault')).toBeVisible()
  await expect.element(values).toHaveTextContent('["hardware.*.fault"]')
})

test('arrow keys select which chip Backspace removes', async () => {
  const { input, chipRemove, values } = await renderField([
    'hardware.*.fault',
    'system.update.fail',
  ])
  await input.click()
  await press('ArrowLeft')
  await press('ArrowLeft')
  await press('Backspace')
  await expect.element(chipRemove('hardware.*.fault')).not.toBeInTheDocument()
  await expect.element(chipRemove('system.update.fail')).toBeVisible()
  await expect.element(values).toHaveTextContent('["system.update.fail"]')
})

test('sorts new selections to the top only after reopening the catalog', async () => {
  const { screen, input, listbox, option, values } = await renderField()
  await input.click()
  await expect
    .element(listbox.getByRole('option').first())
    .toMatchTextContent('hardware.power_shelf.psu.insert')
  await option('system.update.fail').click()
  await expect.element(values).toHaveTextContent('["system.update.fail"]')
  await expect
    .element(listbox.getByRole('option').first())
    .toMatchTextContent('hardware.power_shelf.psu.insert')

  await screen.getByRole('button', { name: 'Outside' }).click()
  await input.click()
  await expect
    .element(listbox.getByRole('option').first())
    .toMatchTextContent('system.update.fail')
})

test('discards uncommitted plain text on blur', async () => {
  const { screen, input, chipRemove, values } = await renderField()
  await input.fill('leftover')
  await screen.getByRole('button', { name: 'Outside' }).click()
  await expect.element(input).toHaveValue('')
  await expect.element(chipRemove('leftover')).not.toBeInTheDocument()
  await expect.element(values).toHaveTextContent('[]')
})
