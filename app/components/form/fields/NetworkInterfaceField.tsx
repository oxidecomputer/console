/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { useController, type Control } from 'react-hook-form'

import type { InstanceNetworkInterfaceCreate } from '@oxide/api'

import type { InstanceCreateInput } from '~/forms/instance-create'
import { CreateNetworkInterfaceForm } from '~/forms/network-interface-create'
import { Button } from '~/ui/lib/Button'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { MiniTable } from '~/ui/lib/MiniTable'
import { Radio } from '~/ui/lib/Radio'
import { RadioGroup } from '~/ui/lib/RadioGroup'

/**
 * Designed less for reuse, more to encapsulate logic that would otherwise
 * clutter the instance create form.
 */
export function NetworkInterfaceField({
  control,
  disabled,
}: {
  control: Control<InstanceCreateInput>
  disabled: boolean
}) {
  const [showForm, setShowForm] = useState(false)

  /**
   * Used to preserve previous user choices in case they accidentally
   * change the radio selection
   */
  const [oldParams, setOldParams] = useState<InstanceNetworkInterfaceCreate[]>([])

  const {
    field: { value, onChange },
  } = useController({ control, name: 'networkInterfaces' })

  // Map API types to radio values
  // 'default_ipv4' | 'default_ipv6' | 'default_dual_stack' all map to 'default'
  const radioValue =
    value.type === 'default_ipv4' ||
    value.type === 'default_ipv6' ||
    value.type === 'default_dual_stack'
      ? 'default'
      : value.type

  const isDefaultSelected = radioValue === 'default'

  return (
    <div className="max-w-lg space-y-2">
      <FieldLabel id="network-interface-type-label">Network interface</FieldLabel>
      <div className="space-y-4">
        <RadioGroup
          aria-labelledby="network-interface-type-label"
          name="networkInterfaceType"
          column
          className="pt-1"
          defaultChecked={radioValue}
          onChange={(event) => {
            const radioSelection = event.target.value

            if (value.type === 'create') {
              setOldParams(value.params)
            }

            if (radioSelection === 'create') {
              onChange({ type: 'create', params: oldParams })
            } else if (radioSelection === 'default') {
              // When user selects 'default', use dual_stack as the default
              onChange({ type: 'default_dual_stack' })
            } else if (radioSelection === 'none') {
              onChange({ type: 'none' })
            }
          }}
          disabled={disabled}
        >
          <Radio value="none">None</Radio>
          <Radio value="default">Default</Radio>
          <Radio value="create">Custom</Radio>
        </RadioGroup>
        {isDefaultSelected && (
          <div className="ml-7 space-y-2">
            <RadioGroup
              aria-label="IP version"
              name="ipVersion"
              column
              className="pt-1"
              defaultChecked={value.type}
              onChange={(event) => {
                const ipVersionType = event.target.value as
                  | 'default_ipv4'
                  | 'default_ipv6'
                  | 'default_dual_stack'
                onChange({ type: ipVersionType })
              }}
              disabled={disabled}
            >
              <Radio value="default_dual_stack">IPv4 & IPv6</Radio>
              <Radio value="default_ipv4">IPv4</Radio>
              <Radio value="default_ipv6">IPv6</Radio>
            </RadioGroup>
          </div>
        )}
        {value.type === 'create' && (
          <>
            <MiniTable
              className="pt-2"
              ariaLabel="Network Interfaces"
              items={value.params}
              columns={[
                { header: 'Name', cell: (item) => item.name },
                { header: 'VPC', cell: (item) => item.vpcName },
                { header: 'Subnet', cell: (item) => item.subnetName },
              ]}
              rowKey={(item) => item.name}
              onRemoveItem={(item) =>
                onChange({
                  type: 'create',
                  params: value.params.filter((i) => i.name !== item.name),
                })
              }
              removeLabel={(item) => `remove network interface ${item.name}`}
            />

            {showForm && (
              <CreateNetworkInterfaceForm
                onSubmit={(networkInterface) => {
                  onChange({
                    type: 'create',
                    params: [...value.params, networkInterface],
                  })
                  setShowForm(false)
                }}
                onDismiss={() => setShowForm(false)}
              />
            )}
            <div className="space-x-3">
              <Button size="sm" onClick={() => setShowForm(true)}>
                Add network interface
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
