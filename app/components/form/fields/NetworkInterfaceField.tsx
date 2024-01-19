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
import { Button, Error16Icon, FieldLabel, MiniTable, Radio, RadioGroup } from '@oxide/ui'

import type { InstanceCreateInput } from 'app/forms/instance-create'
import CreateNetworkInterfaceForm from 'app/forms/network-interface-create'

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

          newType === 'create'
            ? onChange({ type: newType, params: oldParams })
            : onChange({ type: newType })
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
            <MiniTable.Table className="mb-4">
              <MiniTable.Header>
                <MiniTable.HeadCell>Name</MiniTable.HeadCell>
                <MiniTable.HeadCell>VPC</MiniTable.HeadCell>
                <MiniTable.HeadCell>Subnet</MiniTable.HeadCell>
                {/* For remove button */}
                <MiniTable.HeadCell className="w-12" />
              </MiniTable.Header>
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
                    <MiniTable.Cell>
                      <button
                        onClick={() =>
                          onChange({
                            type: 'create',
                            params: value.params.filter((i) => i.name !== item.name),
                          })
                        }
                      >
                        <Error16Icon title={`remove ${item.name}`} />
                      </button>
                    </MiniTable.Cell>
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
  )
}
