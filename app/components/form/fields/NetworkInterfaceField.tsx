/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { useController, type Control } from 'react-hook-form'

import type {
  InstanceNetworkInterfaceAttachment,
  InstanceNetworkInterfaceCreate,
} from '@oxide/api'

import type { InstanceCreateInput } from '~/forms/instance-create'
import { CreateNetworkInterfaceForm } from '~/forms/network-interface-create'
import { Button } from '~/ui/lib/Button'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import * as MiniTable from '~/ui/lib/MiniTable'
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

  return (
    <div className="max-w-lg space-y-2">
      <FieldLabel id="network-interface-type-label">Network interface</FieldLabel>
      <div className="space-y-4">
        <RadioGroup
          aria-labelledby="network-interface-type-label"
          name="networkInterfaceType"
          column
          className="pt-1"
          defaultChecked={value.type}
          onChange={(event) => {
            const newType = event.target.value as InstanceNetworkInterfaceAttachment['type']

            if (value.type === 'create') {
              setOldParams(value.params)
            }

            if (newType === 'create') {
              onChange({ type: newType, params: oldParams })
            } else {
              onChange({ type: newType })
            }
          }}
          disabled={disabled}
        >
          <Radio value="none">None</Radio>
          <Radio value="default">Default</Radio>
          <Radio value="create">Custom</Radio>
        </RadioGroup>
        {value.type === 'create' && (
          <>
            {value.params.length > 0 && (
              <MiniTable.Table className="pt-2">
                <MiniTable.Header columns={['Name', 'VPC', 'Subnet']} canRemove />
                <MiniTable.Body>
                  {value.params.map((item, index) => (
                    <MiniTable.Row
                      tabIndex={0}
                      aria-rowindex={index + 1}
                      aria-label={`Name: ${item.name}, Vpc: ${item.vpcName}, Subnet: ${item.subnetName}`}
                      key={item.name}
                    >
                      <MiniTable.Cell>{item.name}</MiniTable.Cell>
                      <MiniTable.Cell>{item.vpcName}</MiniTable.Cell>
                      <MiniTable.Cell>{item.subnetName}</MiniTable.Cell>
                      <MiniTable.RemoveCell
                        onClick={() =>
                          onChange({
                            type: 'create',
                            params: value.params.filter((i) => i.name !== item.name),
                          })
                        }
                        label={`remove network interface ${item.name}`}
                      />
                    </MiniTable.Row>
                  ))}
                </MiniTable.Body>
              </MiniTable.Table>
            )}

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
