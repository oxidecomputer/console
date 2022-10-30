import { useField } from 'formik'
import { useState } from 'react'

import type { InstanceNetworkInterfaceAttachment, NetworkInterfaceCreate } from '@oxide/api'
import { Button, Error16Icon, MiniTable, Radio } from '@oxide/ui'

import { RadioField } from 'app/components/form'
import CreateNetworkInterfaceForm from 'app/forms/network-interface-create'

export function NetworkInterfaceField() {
  const [showForm, setShowForm] = useState(false)

  /**
   * Used to preserve previous user choices in case they accidentally
   * change the radio selection
   */
  const [oldParams, setOldParams] = useState<NetworkInterfaceCreate[]>([])

  const [, { value }, { setValue }] = useField<InstanceNetworkInterfaceAttachment>({
    name: 'networkInterfaces',
  })

  return (
    <div className="max-w-lg space-y-5">
      <RadioField
        id="network-interface-type"
        name="networkInterfaceType"
        column
        label="Network interface"
        className="pt-1"
        onChange={(event) => {
          const newType = event.target.value as InstanceNetworkInterfaceAttachment['type']

          if (value.type === 'create') {
            setOldParams(value.params)
          }

          newType === 'create'
            ? setValue({ type: newType, params: oldParams })
            : setValue({ type: newType })
        }}
      >
        <Radio value="none">None</Radio>
        <Radio value="default">Default</Radio>
        <Radio value="create">Custom</Radio>
      </RadioField>
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
                          setValue({
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
                setValue({
                  type: 'create',
                  params: [...value.params, networkInterface],
                })
                setShowForm(false)
              }}
              onDismiss={() => setShowForm(false)}
            />
          )}
          <div className="space-x-3">
            <Button variant="default" size="sm" onClick={() => setShowForm(true)}>
              Add network interface
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
