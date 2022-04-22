import { useState } from 'react'
import { useField } from 'formik'
import { Button, Error16Icon, MiniTable, Radio, SideModal } from '@oxide/ui'
import type { InstanceNetworkInterfaceAttachment, NetworkInterfaceCreate } from '@oxide/api'
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

          if (value.type === 'Create') {
            setOldParams(value.params)
          }

          newType === 'Create'
            ? setValue({ type: newType, params: oldParams })
            : setValue({
                type: newType,
              })
        }}
      >
        <Radio value="None">None</Radio>
        <Radio value="Default">Default</Radio>
        <Radio value="Create">Custom</Radio>
      </RadioField>
      {value.type === 'Create' && (
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
                      <Button
                        variant="link"
                        onClick={() =>
                          setValue({
                            type: 'Create',
                            params: value.params.filter((i) => i.name !== item.name),
                          })
                        }
                      >
                        <Error16Icon title={`remove ${item.name}`} />
                      </Button>
                    </MiniTable.Cell>
                  </MiniTable.Row>
                ))}
              </MiniTable.Body>
            </MiniTable.Table>
          )}

          <SideModal
            id="create-disk-modal"
            isOpen={showForm}
            onDismiss={() => setShowForm(false)}
          >
            <CreateNetworkInterfaceForm
              onSubmit={(networkInterface) => {
                setValue({
                  type: 'Create',
                  params: [...value.params, networkInterface],
                })
                setShowForm(false)
              }}
            />
          </SideModal>
          <div className="space-x-3">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
              Add network interface
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
