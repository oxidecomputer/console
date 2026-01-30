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
import { Badge } from '@oxide/design-system/ui'

import type { InstanceCreateInput } from '~/forms/instance-create'
import { CreateNetworkInterfaceForm } from '~/forms/network-interface-create'
import { Button } from '~/ui/lib/Button'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { MiniTable } from '~/ui/lib/MiniTable'
import { Radio } from '~/ui/lib/Radio'
import { RadioGroup } from '~/ui/lib/RadioGroup'
import { TextInputHint } from '~/ui/lib/TextInput'

/**
 * Designed less for reuse, more to encapsulate logic that would otherwise
 * clutter the instance create form.
 */
export function NetworkInterfaceField({
  control,
  disabled,
  hasVpcs,
}: {
  control: Control<InstanceCreateInput>
  disabled: boolean
  hasVpcs: boolean
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

  return (
    <div className="max-w-lg space-y-2">
      <FieldLabel id="network-interface-type-label">Network interface</FieldLabel>
      <TextInputHint id="network-interface-type-hint">
        Use the project’s{' '}
        <Badge className="normal-case!" color="neutral">
          default
        </Badge>{' '}
        VPC and Subnet, using the selected IP version(s)
      </TextInputHint>
      <div className="space-y-4">
        <RadioGroup
          aria-labelledby="network-interface-type-label"
          name="networkInterfaceType"
          column
          className="pt-1"
          defaultChecked={value.type}
          disabled={disabled}
          onChange={(event) => {
            const newType = event.target.value

            if (value.type === 'create') {
              setOldParams(value.params)
            }

            if (newType === 'create') {
              onChange({ type: 'create', params: oldParams })
            } else {
              onChange({ type: newType as typeof value.type })
            }
          }}
        >
          {/*
              Pre-selected default is dual-stack when VPCs exist (set in instance-create).
              This matches the API default and works with both IPv4 and IPv6 subnets.
              User can manually select a specific IP version if needed.
          */}
          <Radio value="default_ipv4" disabled={!hasVpcs}>
            Default IPv4
          </Radio>
          <Radio value="default_ipv6" disabled={!hasVpcs}>
            Default IPv6
          </Radio>
          <Radio value="default_dual_stack" disabled={!hasVpcs}>
            Default IPv4 & IPv6
          </Radio>
          <Radio value="none">None</Radio>
          {/* Custom follows None because of `Add network interface` button and table */}
          <Radio value="create" disabled={!hasVpcs}>
            Custom
          </Radio>
        </RadioGroup>
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
