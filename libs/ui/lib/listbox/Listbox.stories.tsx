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
  const [value, setValue] = useState('')
  return (
    <Listbox
      items={SAMPLE_OPTIONS}
      selectedItem={value}
      onChange={(e) => setValue(e ? e.value : '')}
    />
  )
}

export const WithDefaultValue = () => {
  const [value, setValue] = useState('de')
  return (
    <Listbox
      items={SAMPLE_OPTIONS}
      selectedItem={value}
      onChange={(e) => setValue(e ? e.value : '')}
    />
  )
}
