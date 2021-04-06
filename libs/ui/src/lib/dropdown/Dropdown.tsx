import type { FC } from 'react'
import React, { useMemo } from 'react'

import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import {
  // Listbox,
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
} from '@reach/listbox'

import { Icon } from '../icon/Icon'
import { Text } from '../text/Text'

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

const Wrapper = styled.div``

/* Hide from sighted users, show to screen readers */
const VisuallyHidden = styled.span`
  position: absolute !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
`

const Label = styled(Text).attrs({
  weight: 500,
  size: 'base',
})``

const StyledListboxInput = styled(ListboxInput)`
  margin-top: ${({ theme }) => theme.spacing(1)};
  border: 1px solid red;
`

export const Dropdown: FC<DropdownProps> = ({
  defaultValue,
  label,
  options,
  showLabel = true,
}) => {
  const labelId = useMemo(() => uuidv4(), [])
  const [value, setValue] = React.useState(defaultValue)
  const handleChange = (value: string) => setValue(value)

  const renderLabel = showLabel ? (
    <Label id={labelId}>{label}</Label>
  ) : (
    <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
  )

  const renderOptions = options.map((option) => {
    return (
      <ListboxOption key={option.value} value={option.value}>
        {option.label}
      </ListboxOption>
    )
  })

  return (
    <Wrapper>
      {renderLabel}
      <StyledListboxInput
        aria-labelledby={labelId}
        value={value}
        onChange={handleChange}
      >
        <ListboxButton arrow={<Icon name="chevron" rotate={'270deg'} />} />
        <ListboxPopover>
          <ListboxList>{renderOptions}</ListboxList>
          <div
            style={{
              padding: '10px 10px 0',
              marginTop: 10,
              borderTop: '1px solid gray',
            }}
          >
            <p>example stuff yay</p>
          </div>
        </ListboxPopover>
      </StyledListboxInput>
    </Wrapper>
  )
}
