import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Dialog } from '@reach/dialog'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'

import { useApiQuery } from '@oxide/api'
import './quick-menu.css'
import { useKey } from '../../hooks'

// TODO: things reach combobox doesn't seem to let me do
// (see cmd+k menu on tailwindcss.com for example)
// - start with popover open
// - always have an element highlights so enter always takes you somewhere

export default () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  useKey(['ctrl+k', 'command+k'], (e) => {
    e.preventDefault()
    setIsOpen(true)
  })

  const reset = () => {
    setIsOpen(false)
    setInput('')
  }

  const { data: projects } = useApiQuery('apiProjectsGet', {})
  const values = projects?.items.map((p) => p.name) || []

  const history = useHistory()
  const goToProject = (value: string) => {
    history.push(`/projects/${value}`)
    reset()
  }
  return (
    <Dialog
      className="QuickMenu !bg-gray-500 !p-4 !w-1/3 !mt-[20vh] border border-gray-400 rounded-px"
      isOpen={isOpen}
      onDismiss={reset}
      aria-label="Quick actions"
    >
      <Combobox aria-label="Quick actions" onSelect={goToProject}>
        <ComboboxInput
          className="mousetrap !bg-gray-500 border-none focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <hr className="my-4" />
        <ComboboxPopover
          portal={false}
          className="!bg-transparent !border-none"
        >
          <ComboboxList className="space-y-2">
            {values
              .filter((v) => new RegExp(input, 'gi').test(v))
              .map((v) => (
                <ComboboxOption
                  className="bg-gray-500 hover:!border-green-500 hover:!bg-gray-500 rounded-px !p-4 text-display-lg border border-gray-400"
                  key={v}
                  value={v}
                />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </Dialog>
  )
}
