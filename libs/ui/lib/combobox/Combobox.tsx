import {
  Combobox as RCombobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'
import { matchSorter } from 'match-sorter'
import type { ChangeEvent } from 'react'
import './Combobox.css'

type ComboboxProps = {
  items: string[]
  value: string
  onSelect: (value: string) => void
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

// TODO: styling on everything looks terrible

/**
 * Reach Combobox with match filtering and sorting powered by match-sorter.
 */
export function Combobox({ items, onChange, onSelect, value }: ComboboxProps) {
  return (
    <RCombobox
      openOnFocus
      className="rounded border bg-default border-default"
      onSelect={onSelect}
    >
      <ComboboxInput
        className={`w-full border-none bg-transparent
        py-[0.5625rem] px-3
        text-sans-md text-default focus:outline-none`}
        onChange={onChange}
        value={value}
      />
      <ComboboxPopover>
        <ComboboxList>
          {matchSorter(items, value).map((item) => (
            <ComboboxOption key={item} value={item} />
          ))}
        </ComboboxList>
      </ComboboxPopover>
    </RCombobox>
  )
}
