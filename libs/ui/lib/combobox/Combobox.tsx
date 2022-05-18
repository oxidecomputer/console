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
  disabled?: boolean
  onSelect: (value: string) => void
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

/**
 * Reach Combobox with match filtering and sorting powered by match-sorter.
 */
export function Combobox({
  items,
  onChange,
  onSelect,
  value,
  disabled,
  ...props
}: ComboboxProps) {
  const matches = matchSorter(items, value)
  return (
    <RCombobox
      openOnFocus
      className="rounded border bg-default border-default focus-within:border-accent hover:focus-within:border-accent"
      onSelect={onSelect}
      {...props}
    >
      <ComboboxInput
        className={`w-full border-none bg-transparent
        py-[0.5625rem] px-3
        text-sans-md text-default focus:outline-none disabled:cursor-not-allowed`}
        onChange={onChange}
        // TODO: better disabled styling
        disabled={disabled}
        // Note that unlike with a plain <input>, passing `onChange` does not
        // also require passing in `value`, and in fact passing in `value`
        // causes weird behavior. Our `onChange` is called in addition to the
        // built-in one that allows it to manage its own state internally; our
        // callback does not replace theirs. In short, do not pass `value` here.
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
