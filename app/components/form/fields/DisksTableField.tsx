import { useState } from 'react'
import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'

import type { DiskCreate } from '@oxide/api'
import { Badge, Button, Error16Icon, FieldLabel, MiniTable } from '@oxide/ui'
import { bytesToGiB } from '@oxide/util'

import AttachDiskSideModalForm from 'app/forms/disk-attach'
import { CreateDiskSideModalForm } from 'app/forms/disk-create'
import type { InstanceCreateInput } from 'app/forms/instance-create'

export type DiskTableItem =
  | (DiskCreate & { type: 'create' })
  | { name: string; type: 'attach' }

/**
 * Designed less for reuse, more to encapsulate logic that would otherwise
 * clutter the instance create form.
 */
export function DisksTableField({ control }: { control: Control<InstanceCreateInput> }) {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const {
    field: { value: items, onChange },
  } = useController({ control, name: 'disks' })

  return (
    <>
      <div className="max-w-lg">
        <FieldLabel id="new-disks-label">{/* this was empty */}</FieldLabel>
        {!!items.length && (
          <MiniTable.Table className="mb-4">
            <MiniTable.Header>
              <MiniTable.HeadCell>Name</MiniTable.HeadCell>
              <MiniTable.HeadCell>Type</MiniTable.HeadCell>
              <MiniTable.HeadCell>Size</MiniTable.HeadCell>
              {/* For remove button */}
              <MiniTable.HeadCell className="w-12" />
            </MiniTable.Header>
            <MiniTable.Body>
              {items.map((item, index) => (
                <MiniTable.Row
                  tabIndex={0}
                  aria-rowindex={index + 1}
                  aria-label={`Name: ${item.name}, Type: ${item.type}`}
                  key={item.name}
                >
                  <MiniTable.Cell>{item.name}</MiniTable.Cell>
                  <MiniTable.Cell>
                    <Badge variant="solid">{item.type}</Badge>
                  </MiniTable.Cell>
                  <MiniTable.Cell>
                    {item.type === 'attach' ? (
                      '-'
                    ) : (
                      <>
                        <span>{bytesToGiB(item.size)}</span>
                        <span className="ml-1 inline-block text-accent-secondary">GiB</span>
                      </>
                    )}
                  </MiniTable.Cell>
                  <MiniTable.Cell>
                    <button
                      onClick={() => onChange(items.filter((i) => i.name !== item.name))}
                    >
                      <Error16Icon title={`remove ${item.name}`} />
                    </button>
                  </MiniTable.Cell>
                </MiniTable.Row>
              ))}
            </MiniTable.Body>
          </MiniTable.Table>
        )}

        <div className="space-x-3">
          <Button size="sm" onClick={() => setShowDiskCreate(true)}>
            Create new disk
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowDiskAttach(true)}>
            Attach existing disk
          </Button>
        </div>
      </div>

      {showDiskCreate && (
        <CreateDiskSideModalForm
          onSubmit={(values) => {
            onChange([...items, { type: 'create', ...values }])
            setShowDiskCreate(false)
          }}
          onDismiss={() => setShowDiskCreate(false)}
        />
      )}
      {showDiskAttach && (
        <AttachDiskSideModalForm
          onDismiss={() => setShowDiskAttach(false)}
          onSubmit={(values) => {
            onChange([...items, { type: 'attach', ...values }])
            setShowDiskAttach(false)
          }}
        />
      )}
    </>
  )
}
