import { useField } from 'formik'
import { Error16Icon } from '@oxide/ui'
import { Button, FieldLabel, MiniTable } from '@oxide/ui'
import { capitalize } from '@oxide/util'
import React from 'react'

// TODO: Simplify this type
type Column<K> = K extends keyof (infer Item)
  ? [key: K, name: string, format?: (value: Item[K]) => string]
  : never

export interface TableFieldProps<Item extends Record<string, any>> {
  id: string
  name?: string
  label?: string
  actionText: string
  onAddItem: (addItem: (item: Item) => void) => void
  onRemoveItem?: (item: Item) => void
  columns: Column<keyof Item>[]
}

export function TableField<Item extends Record<string, any>>({
  id,
  name = id,
  label = capitalize(name),
  actionText,
  onAddItem,
  onRemoveItem,
  columns,
}: TableFieldProps<Item>) {
  const [, { value = [] }, { setValue }] = useField<Item[]>({ name })

  return (
    <div>
      <FieldLabel id={`${id}-label`}>{label}</FieldLabel>
      {!!value.length && (
        <MiniTable>
          <MiniTable.Header>
            {columns.map(([key, display]) => (
              <MiniTable.HeadCell key={`${key}`}>{display}</MiniTable.HeadCell>
            ))}
            {/* For remove button */}
            <MiniTable.HeadCell className="w-12"></MiniTable.HeadCell>
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
                  <Button variant="link" onClick={() => onRemoveItem?.(item)}>
                    <Error16Icon title="remove" />
                  </Button>
                </MiniTable.Cell>
              </MiniTable.Row>
            ))}
          </MiniTable.Body>
        </MiniTable>
      )}
      <Button
        variant="secondary"
        onClick={() => onAddItem((item) => setValue(value.concat(item)))}
      >
        {actionText}
      </Button>
    </div>
  )
}
