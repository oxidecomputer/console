import { useField } from 'formik'
import { Error16Icon } from '@oxide/ui'
import { Button, FieldLabel, MiniTable } from '@oxide/ui'
import { capitalize } from '@oxide/util'
import React from 'react'

type NamedItem = { name: string; [key: string]: any }

// TODO: Simplify this type
type Column<K> = K extends keyof (infer Item)
  ? [key: K, name: string, format?: (value: Item[K]) => string]
  : never

type Action<Item> = [
  name: string,
  action: (addItem: (item: Item) => void) => void
]

export interface TableFieldProps<Item extends NamedItem> {
  id: string
  name?: string
  label?: string
  actionText: string
  onRemoveItem?: (item: Item) => void
  columns: Column<keyof Item>[]
  actions: Action<Item>[]
}

export function TableField<Item extends NamedItem>({
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
    <div className="max-w-lg">
      <FieldLabel id={`${id}-label`}>{label}</FieldLabel>
      {!!value.length && (
        <MiniTable className="mb-4">
          <MiniTable.Header>
            {columns.map(([key, display]) => (
              <MiniTable.HeadCell key={`${key}`}>{display}</MiniTable.HeadCell>
            ))}
            {/* For remove button */}
            <MiniTable.HeadCell className="w-12"></MiniTable.HeadCell>
          </MiniTable.Header>
          <MiniTable.Body>
            {value.map((item, index) => (
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
                  <Button
                    variant="link"
                    onClick={() => {
                      onRemoveItem?.(item)
                      setValue(value.filter((i) => i.name !== item.name))
                    }}
                  >
                    <Error16Icon title={`remove ${item.name}`} />
                  </Button>
                </MiniTable.Cell>
              </MiniTable.Row>
            ))}
          </MiniTable.Body>
        </MiniTable>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onAddItem((item) => setValue(value.concat(item)))}
      >
        {actionText}
      </Button>
    </div>
  )
}
