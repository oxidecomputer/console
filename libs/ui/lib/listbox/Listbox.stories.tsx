import { useState } from 'react'

import { Listbox } from './Listbox'

const SAMPLE_OPTIONS = [
  { value: 'de', label: 'Devon Edwards' },
  { value: 'rm', label: 'Randall Miles' },
  { value: 'cj', label: 'Connie Jones' },
  { value: 'eb', label: 'Esther Black' },
  { value: 'sf', label: 'Shane Flores' },
  { value: 'dh', label: 'Darrell Howard' },
  { value: 'jp', label: 'Jacob Pena' },
  { value: 'nm', label: 'Nathan Mckinney' },
  { value: 'br', label: 'Bessie Robertson' },
]

export const Default = () => {
  const [value, setValue] = useState<string | null>('de')
  return (
    <div className="max-w-lg">
      <Listbox
        selectedItem={value}
        onChange={setValue}
        items={SAMPLE_OPTIONS}
        name="favorite-animal"
        placeholder="Select an animal"
      />
    </div>
  )
}

export const WithError = () => {
  const [value, setValue] = useState<string | null>(null)

  return (
    <div className="max-w-lg">
      <Listbox
        selectedItem={value}
        onChange={setValue}
        items={SAMPLE_OPTIONS}
        name="favorite-animal"
        placeholder="Select an animal"
        hasError
      />
    </div>
  )
}
