import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'
import {
  Listbox,
  // ListboxInput,
  ListboxButton,
  // ListboxPopover,
  // ListboxList,
  ListboxOption,
} from '@reach/listbox'
import '@reach/listbox/styles.css'

/* eslint-disable-next-line */
export interface DropdownProps {
  defaultValue?: string
  /**
   * Required for accessibility. Description of the dropdown.
   */
  label: string
  options: { value: string; label: string }[]
  /**
   * Whether to show label to sighted users
   */
  showLabel?: boolean
  size?: 'sm' | 'lg'
}

const StyledDropdown = styled.div`
  color: pink;
`

/* Hide from sighted users, show to screen readers */
const VisuallyHidden = styled.div`
  position: absolute !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
`

export const Dropdown: FC<DropdownProps> = ({
  defaultValue,
  label,
  options,
  showLabel = true,
}) => {
  const renderLabel = showLabel ? (
    <div id="id">{label}</div>
  ) : (
    <VisuallyHidden id="id">{label}</VisuallyHidden>
  )

  const renderOptions = options.map((option) => {
    return (
      <ListboxOption key={option.value} value={option.value}>
        {option.label}
      </ListboxOption>
    )
  })

  return (
    <StyledDropdown>
      {renderLabel}
      <Listbox
        aria-labelledby="id"
        defaultValue={defaultValue}
        button={<ListboxButton />}
      >
        {renderOptions}
      </Listbox>
    </StyledDropdown>
  )
}
