import { useState } from 'react'
import { useField } from 'formik'
import type { DiskCreateValues } from 'app/forms/disk-create'
import type { DiskAttachValues } from 'app/forms/disk-attach'
import { CreateDiskForm } from 'app/forms/disk-create'
import { AttachDiskForm } from 'app/forms/disk-attach'
import { Button, Error16Icon, FieldLabel, MiniTable, SideModal } from '@oxide/ui'

export type DiskTableItem =
  | (DiskCreateValues & { type: 'create' })
  | (DiskAttachValues & { type: 'attach' })

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
                    <Button
                      variant="link"
                      onClick={() => setItems(items.filter((i) => i.name !== item.name))}
                    >
                      <Error16Icon title={`remove ${item.name}`} />
                    </Button>
                  </MiniTable.Cell>
                </MiniTable.Row>
              ))}
            </MiniTable.Body>
          </MiniTable.Table>
        )}

        <div className="space-x-3">
          <Button variant="secondary" size="sm" onClick={() => setShowDiskCreate(true)}>
            Create new disk
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowDiskAttach(true)}>
            Attach existing disk
          </Button>
        </div>
      </div>

      <SideModal
        id="create-disk-modal"
        isOpen={showDiskCreate}
        onDismiss={() => setShowDiskCreate(false)}
      >
        <CreateDiskForm
          onSubmit={(values) => {
            setItems([...items, { type: 'create', ...values }])
            setShowDiskCreate(false)
          }}
        />
      </SideModal>
      <SideModal
        id="attach-disk-modal"
        isOpen={showDiskAttach}
        onDismiss={() => setShowDiskAttach(false)}
      >
        <AttachDiskForm
          onSubmit={(values) => {
            setItems([...items, { type: 'attach', ...values }])
            setShowDiskAttach(false)
          }}
        />
      </SideModal>
    </>
  )
}
