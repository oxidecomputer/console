import { Error16Icon } from '@oxide/ui'
import { Button, FieldLabel, MiniTable } from '@oxide/ui'
import { capitalize } from '@oxide/util'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NamedItem = { name: string; [key: string]: any }

// TODO: Simplify this type
type Column<K> = K extends keyof (infer Item)
  ? [key: K, name: string, format?: (value: Item[K]) => string]
  : never

type Action = [name: string, action: () => void]

export interface TableFieldProps<Item extends NamedItem> {
  id: string
  name?: string
  label?: string
  onRemoveItem: (item: Item) => void
  columns: Column<keyof Item>[]
  actions: Action[]
  items: Item[]
}

export function TableField<Item extends NamedItem>({
  id,
  name = id,
  label = capitalize(name),
  onRemoveItem,
  columns,
  actions,
  items,
}: TableFieldProps<Item>) {
  return (
    <div className="max-w-lg">
      <FieldLabel id={`${id}-label`}>{label}</FieldLabel>
      {!!items.length && (
        <MiniTable className="mb-4">
          <MiniTable.Header>
            {columns.map(([key, display]) => (
              <MiniTable.HeadCell key={`${key}`}>{display}</MiniTable.HeadCell>
            ))}
            {/* For remove button */}
            <MiniTable.HeadCell className="w-12"></MiniTable.HeadCell>
          </MiniTable.Header>
          <MiniTable.Body>
            {items.map((item, index) => (
              <MiniTable.Row
                tabindex="0"
                aria-rowindex={index + 1}
                aria-label={columns
                  .map(([key, name]) => `${name}: ${item[key]}`)
                  .join(' ')}
                key={`item-${index}`}
              >
                {columns.map(([key]) => (
                  <MiniTable.Cell key={`cell-${key}`}>
                    {item[key]}
                  </MiniTable.Cell>
                ))}
                <MiniTable.Cell>
                  <Button variant="link" onClick={() => onRemoveItem(item)}>
                    <Error16Icon title={`remove ${item.name}`} />
                  </Button>
                </MiniTable.Cell>
              </MiniTable.Row>
            ))}
          </MiniTable.Body>
        </MiniTable>
      )}
      <div className="space-x-3">
        {actions.map(([name, action]) => (
          <Button key={name} variant="secondary" size="sm" onClick={action}>
            {name}
          </Button>
        ))}
      </div>
    </div>
  )
}
