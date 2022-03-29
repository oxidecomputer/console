import { useField } from 'formik'
import { Error16Icon } from '@oxide/ui'
import { Button, FieldLabel, MiniTable } from '@oxide/ui'
import { capitalize } from '@oxide/util'
import React from 'react'

export interface TableFieldProps<Item extends Record<string, any>> {
  id: string
  name?: string
  label?: string
  actionText: string
  addItem: () => Item
  onItemRemoved?: (item: Item) => void
  columns: [[key: keyof Item, display: string]]
}

export function TableField<Item extends Record<string, any>>({
  id,
  name = id,
  label = capitalize(name),
  actionText,
  columns,
}: TableFieldProps<Item>) {
  const [, { value = [] }, { setValue }] = useField<Item[]>({ name })

  return (
    <div>
      <FieldLabel id={`${id}-label`}>{label}</FieldLabel>
      {value.length && (
        <MiniTable>
          <MiniTable.Header>
            {columns.map(([key, display]) => (
              <MiniTable.HeadCell key={`${key}`}>{display}</MiniTable.HeadCell>
            ))}
            {/* For remove button */}
            <MiniTable.HeadCell className="w-9"></MiniTable.HeadCell>
          </MiniTable.Header>
          <MiniTable.Body>
            {value.map((item, index) => (
              <MiniTable.Row key={`item-${index}`}>
                {columns.map(([key]) => (
                  <MiniTable.Cell key={`cell-${key}`}>
                    {item[key]}
                  </MiniTable.Cell>
                ))}
                <MiniTable.Cell>
                  <Error16Icon />
                </MiniTable.Cell>
              </MiniTable.Row>
            ))}
          </MiniTable.Body>
        </MiniTable>
      )}
      <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
        {actionText}
      </Button>
    </div>
  )
}
