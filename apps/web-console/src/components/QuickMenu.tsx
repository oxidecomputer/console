import React, { useState } from 'react'
import { Dialog } from '@reach/dialog'

import { Input } from '@oxide/ui'
import { useKey } from '../hooks'

const values = 'hello there my good friend'.split(' ')

export default () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  useKey(['ctrl+k', 'command+k'], (e) => {
    e.preventDefault()
    setIsOpen(true)
  })
  return (
    <Dialog
      className="!bg-gray-500 border border-gray-400 rounded-px"
      isOpen={isOpen}
      onDismiss={() => setIsOpen(false)}
    >
      <form>
        {/* mousetrap lets us still capture cmd+k while we're in the field */}
        <Input
          autoFocus
          className="mousetrap"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <hr />
        <ul>
          {values
            .filter((v) => new RegExp(input, 'gi').test(v))
            .map((v) => (
              <li key={v}>{v}</li>
            ))}
        </ul>
      </form>
    </Dialog>
  )
}
