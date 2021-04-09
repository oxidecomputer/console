import type { FC } from 'react'
import React from 'react'

import type { StyledComponentProps } from 'styled-components'
import styled, { css } from 'styled-components'
import { useSelect } from 'downshift'
import { AnimatePresence, motion } from 'framer-motion'

import type { Theme } from '@oxide/theme'
import { Icon } from '../icon/Icon'
import { Text } from '../text/Text'

type SizeType = 'sm' | 'lg'
type OptionType = { value: string; label: string }
export interface DropdownProps {
  defaultValue?: string
  /**
   * Required for accessibility. Description of the dropdown.
   */
  label: string
  options: OptionType[]
  /**
   * Whether to show label to sighted users
   */
  showLabel?: boolean
  size?: SizeType
}

const Wrapper = styled.div`
  position: relative;
`

/* Hide from sighted users, show to screen readers */
const VisuallyHidden = styled.label`
  position: absolute !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
`

const Label = styled(Text).attrs({
  as: 'label',
  color: 'white',
  size: 'sm',
})``

type ButtonProps = StyledComponentProps<
  'button',
  Theme,
  { placeholder: boolean },
  never
>

const StyledButton = styled.button<ButtonProps>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-top: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};
  vertical-align: top;
  width: 100%;

  background-color: ${({ theme }) => theme.color('gray800')};
  border: none;
  color: ${({ theme }) => theme.color('gray50')};
  font-size: ${({ theme }) => theme.spacing(4)};

  font-weight: ${({ placeholder }) => (placeholder ? 400 : 500)};
  line-height: 1.5;

  &:hover {
    background-color: ${({ theme }) => theme.color('gray700')};
  }

  &:focus {
    box-shadow: ${({ theme }) => `0 0 0 1px ${theme.color('green500')}`};
    outline: none;
  }
`

const StyledIcon = styled(Icon).attrs({
  name: 'chevron',
  rotate: '270deg',
})`
  margin-left: ${({ theme }) => theme.spacing(5)};
`

const StyledMenu = styled(motion.ul)`
  z-index: 1;
  position: absolute;
  left: 0;
  right: 0;

  overflow-y: auto;
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(1)};
  padding: 0;

  background-color: ${({ theme }) => theme.color('gray800')};
  box-shadow: ${({ theme }) =>
    `0 ${theme.spacing(3)} ${theme.spacing(6)} ${theme.color('black', 0.16)}`};

  list-style: none;

  &:focus {
    box-shadow: ${({ theme }) => `0 0 0 1px ${theme.color('green500')}`};
    outline: none;
  }
`

const getOptionStyles = (size: SizeType) => {
  switch (size) {
    case 'lg':
      return css`
        padding: ${({ theme }) => `${theme.spacing(2.5)} ${theme.spacing(4)}`};
      `
    default:
    case 'sm':
      return css`
        padding: ${({ theme }) => `${theme.spacing(1.5)} ${theme.spacing(4)}`};
      `
  }
}

const StyledOption = styled.li<{ size: SizeType; isHighlighted: boolean }>`
  color: ${({ theme }) => theme.color('gray200')};
  font-size: ${({ theme }) => theme.spacing(3.5)};
  font-weight: 400;
  line-height: 1.5;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.color('gray700')};
  }

  &:focus {
    outline: none;
    box-shadow: ${({ theme }) => `0 0 0 1px ${theme.color('green500')}`};
  }

  &:first-child {
    margin-top: ${({ theme }) => theme.spacing(2)};
  }

  &:last-child {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  ${({ size }) => getOptionStyles(size)};
  ${({ isHighlighted, theme }) =>
    isHighlighted && `background-color: ${theme.color('gray700')};`};
`

export const Dropdown: FC<DropdownProps> = ({
  defaultValue,
  label,
  options,
  showLabel = true,
  size = 'sm',
}) => {
  const itemToString = (item: OptionType | null) => (item ? item.label : '')
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    initialSelectedItem:
      options.find((option) => option.value === defaultValue) || null,
    items: options,
    itemToString: itemToString,
  })

  const renderLabel = showLabel ? (
    <Label {...getLabelProps()}>{label}</Label>
  ) : (
    <VisuallyHidden {...getLabelProps()}>{label}</VisuallyHidden>
  )

  const renderOptions = options.map((option, index) => (
    <StyledOption
      key={option.value}
      value={option.value}
      size={size}
      {...getItemProps({ item: option, index })}
      isHighlighted={highlightedIndex === index}
    >
      {option.label}
    </StyledOption>
  ))

  const variants = {
    open: {
      opacity: 1,
      scale: 1,
      transition: { ease: 'easeOut', duration: 0.1 },
    },
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: { ease: 'easeIn', duration: 0.075 },
    },
  }

  return (
    <Wrapper>
      {renderLabel}
      <StyledButton
        type="button"
        {...getToggleButtonProps()}
        placeholder={selectedItem ? false : true}
      >
        {selectedItem ? itemToString(selectedItem) : label}
        <StyledIcon />
      </StyledButton>
      <AnimatePresence>
        {isOpen && (
          <StyledMenu
            variants={variants}
            initial={'closed'}
            animate={'open'}
            exit={'closed'}
            {...getMenuProps()}
          >
            {renderOptions}
          </StyledMenu>
        )}
      </AnimatePresence>
      {/* if you Tab from menu, focus goes on button, and it shouldn't. only happens here. */}
      <div tabIndex={0} />
    </Wrapper>
  )
}
