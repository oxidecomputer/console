import { useField } from 'formik'
import { useState } from 'react'

import type { DiskCreate, DiskIdentifier } from '@oxide/api'
import { Button, Error16Icon, FieldLabel, MiniTable } from '@oxide/ui'

import AttachDiskSideModalForm from 'app/forms/disk-attach'
import { CreateDiskSideModalForm } from 'app/forms/disk-create'

export type DiskTableItem =
  | (DiskCreate & { type: 'create' })
  | (DiskIdentifier & { type: 'attach' })

export function DisksTableField() {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const [, { value: items = [] }, { setValue: setItems }] = useField<DiskTableItem[]>({
    name: 'disks',
  })

  return (
    <>
      <div className="max-w-lg">
        <FieldLabel id="new-disks-label">{/* this was empty */}</FieldLabel>
        {!!items.length && (
          <MiniTable.Table className="mb-4">
            <MiniTable.Header>
              <MiniTable.HeadCell>Name</MiniTable.HeadCell>
              <MiniTable.HeadCell>Type</MiniTable.HeadCell>
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
                  <MiniTable.Cell>{item.type}</MiniTable.Cell>
                  <MiniTable.Cell>
                    <button
                      onClick={() => setItems(items.filter((i) => i.name !== item.name))}
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
          <Button variant="default" size="sm" onClick={() => setShowDiskCreate(true)}>
            Create new disk
          </Button>
          <Button
            variant="ghost"
            color="secondary"
            size="sm"
            onClick={() => setShowDiskAttach(true)}
          >
            Attach existing disk
          </Button>
        </div>
      </div>

      {showDiskCreate && (
        <CreateDiskSideModalForm
          onSubmit={(values) => {
            setItems([...items, { type: 'create', ...values }])
            setShowDiskCreate(false)
          }}
          onDismiss={() => setShowDiskCreate(false)}
        />
      )}
      <AttachDiskSideModalForm
        isOpen={showDiskAttach}
        onDismiss={() => setShowDiskAttach(false)}
        onSubmit={(values) => {
          setItems([...items, { type: 'attach', ...values }])
          setShowDiskAttach(false)
        }}
      />
    </>
  )
}
