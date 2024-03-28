/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import { ActionMenu } from './ActionMenu'
import { Button } from './Button'

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
