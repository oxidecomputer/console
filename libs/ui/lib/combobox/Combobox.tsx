import { useState } from 'react'
import {
  Combobox as RCombobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'
import { matchSorter } from 'match-sorter'
import './Combobox.css'

type ComboboxProps = {
  items: string[]
  disabled?: boolean
  onSelect: (value: string) => void
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

/**
 * Reach Combobox with match filtering and sorting powered by match-sorter.
 */
export function Combobox({ items, onSelect, disabled, ...props }: ComboboxProps) {
  // only local input state, not the value considered "selected" by the combobox
  const [inputValue, setInputValue] = useState('')

  const matches = matchSorter(items, inputValue)

  function setValue(value: string) {
    onSelect(value)
    setInputValue(value)
  }

  return (
    <RCombobox
      openOnFocus
      className="rounded border bg-default border-default focus-within:border-accent hover:focus-within:border-accent"
      // assume value is allowed since it was selected
      onSelect={setValue}
      {...props}
    >
      <ComboboxInput
        className={`w-full border-none bg-transparent
        py-[0.5625rem] px-3
        text-sans-md text-default focus:outline-none disabled:cursor-not-allowed`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        // if value is in items, select it for real. otherwise reset the input
        onBlur={() => setValue(items.includes(inputValue.trim()) ? inputValue.trim() : '')}
        // TODO: better disabled styling
        disabled={disabled}
      />
      <ComboboxPopover className="mt-2 bg-default">
        {matches.length === 0 ? (
          <p className="rounded border px-3 py-2 italic text-sans-sm text-secondary border-default">
            {/* TODO: would be nicer to say something custom like "No matching disks found" */}
            No matches found
          </p>
        ) : (
          <ComboboxList persistSelection className="rounded border border-default">
            {matches.map((item, i) => (
              <ComboboxOption
                // TODO: make border overlap container border like Justin's beautiful tables
                className="cursor-pointer rounded border px-3 py-2 text-sans-sm border-default hover:bg-hover"
                key={item}
                value={item}
                // looks pointless but is needed to prevent weird ordering bugs
                // when using arrow keys. See https://github.com/reach/reach-ui/issues/840
                index={i}
              />
            ))}
          </ComboboxList>
        )}
      </ComboboxPopover>
    </RCombobox>
  )
}
