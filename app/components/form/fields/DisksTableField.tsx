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

import { AttachDiskSideModalForm } from '~/forms/disk-attach'
import { CreateDiskSideModalForm } from '~/forms/disk-create'
import type { InstanceCreateInput } from '~/forms/instance-create'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import * as MiniTable from '~/ui/lib/MiniTable'
import { Truncate } from '~/ui/lib/Truncate'
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
      <div className="max-w-lg">
        {!!items.length && (
          <MiniTable.Table className="mb-4" aria-label="Disks">
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
                  <MiniTable.Cell>
                    <Truncate text={item.name} maxLength={35} />
                  </MiniTable.Cell>
                  <MiniTable.Cell>
                    <Badge variant="solid">{item.type}</Badge>
                  </MiniTable.Cell>
                  <MiniTable.Cell>
                    {item.type === 'attach' ? (
                      '—'
                    ) : (
                      <>
                        <span>{bytesToGiB(item.size)}</span>
                        <span className="ml-1 inline-block text-accent-secondary">GiB</span>
                      </>
                    )}
                  </MiniTable.Cell>
                  <MiniTable.RemoveCell
                    onClick={() => onChange(items.filter((i) => i.name !== item.name))}
                    label={`remove disk ${item.name}`}
                  />
                </MiniTable.Row>
              ))}
            </MiniTable.Body>
          </MiniTable.Table>
        )}

        <div className="space-x-3">
          <Button size="sm" onClick={() => setShowDiskCreate(true)} disabled={disabled}>
            Create new disk
          </Button>
          <Button
            variant="ghost"
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
        <AttachDiskSideModalForm
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
