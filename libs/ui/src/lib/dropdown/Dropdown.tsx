import type { FC } from 'react'
import React, { useMemo } from 'react'

import styled, { css } from 'styled-components'
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

type SizeType = 'sm' | 'lg'
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
  size?: SizeType
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
`

const getButtonStyles = (size: SizeType) => {
  switch (size) {
    case 'lg':
      return css``

    default:
    case 'sm':
      return css`
        padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};

        font-size: ${({ theme }) => theme.spacing(4)};
        line-height: 1.5;
      `
  }
}

const StyledListboxButton = styled(ListboxButton)<{ size: SizeType }>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  vertical-align: top;

  background-color: ${({ theme }) => theme.color('gray800')};
  color: ${({ theme }) => theme.color('gray50')};

  /* Target the <span> parent of the StyledIcon to vertically center align the icon */
  [data-reach-listbox-arrow] {
    display: flex;
  }

  ${({ size }) => getButtonStyles(size)};
`

const StyledIcon = styled(Icon).attrs({
  name: 'chevron',
  rotate: '270deg',
})``

const getOptionStyles = (size: SizeType) => {
  switch (size) {
    case 'lg':
      return css``

    default:
    case 'sm':
      return css`
        padding: ${({ theme }) => `${theme.spacing(1.5)} ${theme.spacing(4)}`};

        font-size: ${({ theme }) => theme.spacing(4)};
        line-height: 1.5;
      `
  }
}

const StyledPopover = styled(ListboxPopover)`
  z-index: 1;

  background-color: ${({ theme }) => theme.color('gray800')};
`

const StyledListboxOption = styled(ListboxOption)<{ size: SizeType }>`
  color: ${({ theme }) => theme.color('gray200')};

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.color('gray900')};
  }

  ${({ size }) => getOptionStyles(size)};
`

export const Dropdown: FC<DropdownProps> = ({
  defaultValue,
  label,
  options,
  showLabel = true,
  size = 'sm',
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
      <StyledListboxOption key={option.value} value={option.value} size={size}>
        {option.label}
      </StyledListboxOption>
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
        <StyledListboxButton arrow={<StyledIcon />} />
        <StyledPopover>
          <ListboxList>{renderOptions}</ListboxList>
        </StyledPopover>
      </StyledListboxInput>
    </Wrapper>
  )
}
