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
import { Listbox } from '~/ui/lib/Listbox'
import { MiniTable } from '~/ui/lib/MiniTable'
import { Radio } from '~/ui/lib/Radio'

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

  // Determine the current "mode" (default, create, none)
  const currentMode =
    value.type === 'none' ? 'none' : value.type === 'create' ? 'create' : 'default'

  // For default mode, use the actual type as the selected value
  const defaultIpVersion = currentMode === 'default' ? value.type : 'default_dual_stack'

  const handleModeChange = (newMode: string) => {
    if (value.type === 'create') {
      setOldParams(value.params)
    }

    if (newMode === 'default') {
      onChange({ type: 'default_dual_stack' })
    } else if (newMode === 'create') {
      onChange({ type: 'create', params: oldParams })
    } else if (newMode === 'none') {
      onChange({ type: 'none' })
    }
  }

  return (
    <div className="max-w-lg space-y-2">
      <FieldLabel id="network-interface-type-label">Network interface</FieldLabel>
      <div
        className="flex flex-col pt-1"
        role="radiogroup"
        aria-labelledby="network-interface-type-label"
      >
        <div className="space-y-2">
          <Radio
            name="networkInterfaceType"
            value="default"
            disabled={!hasVpcs || disabled}
            checked={currentMode === 'default'}
            onChange={(e) => handleModeChange(e.target.value)}
          >
            Default
          </Radio>
          {currentMode === 'default' && (
            <div className="mb-2 ml-6">
              <Listbox
                name="defaultIpVersion"
                items={[
                  { value: 'default_dual_stack', label: 'IPv4 & IPv6' },
                  { value: 'default_ipv4', label: 'IPv4' },
                  { value: 'default_ipv6', label: 'IPv6' },
                ]}
                selected={defaultIpVersion}
                onChange={(type) => onChange({ type })}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Radio
            name="networkInterfaceType"
            value="create"
            disabled={!hasVpcs || disabled}
            checked={currentMode === 'create'}
            onChange={(e) => handleModeChange(e.target.value)}
          >
            Custom
          </Radio>
          {currentMode === 'create' && (
            <div className="ml-6 space-y-3">
              {value.type === 'create' && (
                <>
                  <MiniTable
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
                    emptyState={{
                      title: 'No network interfaces added',
                      body: 'Add a new network interface to attach it to the instance.',
                    }}
                  />
                  <div className="flex justify-end gap-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onChange({ type: 'create', params: [] })}
                    >
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => setShowForm(true)}>
                      Add network interface
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <Radio
          name="networkInterfaceType"
          value="none"
          disabled={disabled}
          checked={currentMode === 'none'}
          onChange={(e) => handleModeChange(e.target.value)}
        >
          None
        </Radio>

        {showForm && (
          <CreateNetworkInterfaceForm
            onSubmit={(networkInterface) => {
              onChange({
                type: 'create',
                params: [
                  ...(value.type === 'create' ? value.params : []),
                  networkInterface,
                ],
              })
              setShowForm(false)
            }}
            onDismiss={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  )
}
