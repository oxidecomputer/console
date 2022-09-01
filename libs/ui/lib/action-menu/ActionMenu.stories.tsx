import { useState } from 'react'

import { Button } from '../button/Button'
import { ActionMenu } from './ActionMenu'

const makeItem = (value: string) => ({
  value,
  onSelect: () => console.log(value),
})

const items = [
  makeItem('Add to group'),
  makeItem('Add to role'),
  makeItem('Remove from group'),
  makeItem('Remove role'),
]

export function Default() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open menu</Button>
      <ActionMenu
        items={items}
        isOpen={isOpen}
        onDismiss={() => {
          setIsOpen(false)
        }}
        aria-label="quick menu"
      />
    </>
  )
}
