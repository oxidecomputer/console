/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  useWatch,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from 'react-hook-form'
import { match } from 'ts-pattern'

import {
  ACPI_TIMEOUT_MAX_SECS,
  ACPI_TIMEOUT_MIN_SECS,
  type InstanceShutdownPolicy,
} from '@oxide/api'

import type { ListboxItem } from '~/ui/lib/Listbox'

import { ListboxField } from './ListboxField'
import { NumberField } from './NumberField'

export type ShutdownAction = InstanceShutdownPolicy['action']

/**
 * Form state keeps the timeout around even when hard off is selected, so
 * flipping the method back and forth doesn't lose what the user typed.
 */
export type ShutdownPolicyFormValues = {
  shutdownAction: ShutdownAction
  shutdownTimeoutSecs: number
}

export const DEFAULT_SHUTDOWN_TIMEOUT_SECS = 60

const shutdownActionItems: ListboxItem<ShutdownAction>[] = [
  { value: 'hard_off', label: 'Hard power off' },
  { value: 'power_button', label: 'Power button' },
]

export const shutdownPolicyToForm = (
  policy: InstanceShutdownPolicy
): ShutdownPolicyFormValues =>
  match(policy)
    .returnType<ShutdownPolicyFormValues>()
    .with({ action: 'hard_off' }, () => ({
      shutdownAction: 'hard_off',
      shutdownTimeoutSecs: DEFAULT_SHUTDOWN_TIMEOUT_SECS,
    }))
    .with({ action: 'power_button' }, ({ timeoutSecs }) => ({
      shutdownAction: 'power_button',
      shutdownTimeoutSecs: timeoutSecs,
    }))
    .exhaustive()

export const shutdownPolicyFromForm = (
  values: ShutdownPolicyFormValues
): InstanceShutdownPolicy =>
  match(values.shutdownAction)
    .returnType<InstanceShutdownPolicy>()
    .with('hard_off', () => ({ action: 'hard_off' }))
    .with('power_button', () => ({
      action: 'power_button',
      timeoutSecs: values.shutdownTimeoutSecs,
    }))
    .exhaustive()

export const shutdownPolicyEqual = (a: InstanceShutdownPolicy, b: InstanceShutdownPolicy) =>
  match([a, b])
    .with([{ action: 'hard_off' }, { action: 'hard_off' }], () => true)
    .with(
      [{ action: 'power_button' }, { action: 'power_button' }],
      ([x, y]) => x.timeoutSecs === y.timeoutSecs
    )
    .otherwise(() => false)

type ShutdownPolicyFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  actionName: FieldPathByValue<TFieldValues, ShutdownAction>
  timeoutName: FieldPathByValue<TFieldValues, number>
  disabled?: boolean
}

/**
 * Shutdown method listbox plus a timeout that only shows for the power button
 * method. Takes field names so it can live in any form.
 */
export function ShutdownPolicyField<TFieldValues extends FieldValues>({
  control,
  actionName,
  timeoutName,
  disabled,
}: ShutdownPolicyFieldProps<TFieldValues>) {
  const action = useWatch({ control, name: actionName })
  return (
    <>
      <ListboxField
        control={control}
        name={actionName}
        label="Shutdown method"
        description="How the instance is shut down when it is stopped or rebooted, including for system updates"
        items={shutdownActionItems}
        required
        disabled={disabled}
      />
      {action === 'power_button' && (
        <NumberField
          control={control}
          name={timeoutName}
          label="Shutdown timeout"
          units="seconds"
          description="How long to wait for the guest OS to shut down before cutting power"
          min={ACPI_TIMEOUT_MIN_SECS}
          max={ACPI_TIMEOUT_MAX_SECS}
          required
          disabled={disabled}
        />
      )}
    </>
  )
}
