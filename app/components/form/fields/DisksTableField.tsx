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
import { Error16Icon } from '@oxide/design-system/icons/react'

import { AttachDiskSideModalForm } from '~/forms/disk-attach'
import { CreateDiskSideModalForm } from '~/forms/disk-create'
import type { InstanceCreateInput } from '~/forms/instance-create'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import * as MiniTable from '~/ui/lib/MiniTable'
import { bytesToGiB } from '~/util/units'

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
}: {
  control: Control<InstanceCreateInput>
  disabled: boolean
}) {
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

        <div className="flex gap-3 md-:flex-col">
          <Button
            size="sm"
            onClick={() => setShowDiskCreate(true)}
            disabled={disabled}
            className="w-full"
          >
            Create new disk
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiskAttach(true)}
            disabled={disabled}
            className="w-full"
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
