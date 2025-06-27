/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { useController, type Control } from 'react-hook-form'

import type { DiskCreate } from '@oxide/api'

import { AttachDiskModalForm } from '~/forms/disk-attach'
import { CreateDiskSideModalForm } from '~/forms/disk-create'
import type { InstanceCreateInput } from '~/forms/instance-create'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { sizeCellInner } from '~/table/columns/common'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { DataMiniTable } from '~/ui/lib/MiniTable'
import { Truncate } from '~/ui/lib/Truncate'

export type DiskTableItem =
  | (DiskCreate & { type: 'create' })
  | { name: string; type: 'attach' }

/**
 * Designed less for reuse, more to encapsulate logic that would otherwise
 * clutter the instance create form.
 */
export function DisksTableField({
  control,
  disabled,
  unavailableDiskNames,
}: {
  control: Control<InstanceCreateInput>
  disabled: boolean
  unavailableDiskNames: string[]
}) {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const {
    field: { value: items, onChange },
  } = useController({ control, name: 'otherDisks' })

  return (
    <>
      <div className="flex max-w-lg flex-col items-end gap-3">
        <DataMiniTable
          ariaLabel="Disks"
          items={items}
          columns={[
            {
              header: 'Name',
              cell: (item) => <Truncate text={item.name} maxLength={35} />,
            },
            {
              header: 'Type',
              cell: (item) => <Badge>{item.type}</Badge>,
            },
            {
              header: 'Size',
              cell: (item) =>
                item.type === 'attach' ? <EmptyCell /> : sizeCellInner(item.size),
            },
          ]}
          rowKey={(item) => item.name}
          onRemoveItem={(item) => onChange(items.filter((i) => i.name !== item.name))}
          removeLabel={(item) => `Remove disk ${item.name}`}
          emptyState={{
            title: 'No disks',
            body: 'Add a disk to see it here',
          }}
        />

        <div className="space-x-3">
          <Button size="sm" onClick={() => setShowDiskCreate(true)} disabled={disabled}>
            Create new disk
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDiskAttach(true)}
            disabled={disabled}
          >
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
          unavailableDiskNames={unavailableDiskNames}
          onDismiss={() => setShowDiskCreate(false)}
        />
      )}
      {showDiskAttach && (
        <AttachDiskModalForm
          onDismiss={() => setShowDiskAttach(false)}
          onSubmit={(values) => {
            onChange([...items, { type: 'attach', ...values }])
            setShowDiskAttach(false)
          }}
          diskNamesToExclude={items.filter((i) => i.type === 'attach').map((i) => i.name)}
        />
      )}
    </>
  )
}
