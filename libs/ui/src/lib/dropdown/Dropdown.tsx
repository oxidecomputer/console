import type { FC } from 'react'
import React from 'react'

import type { StyledComponentProps } from 'styled-components'
import styled, { css } from 'styled-components'
import { useSelect } from 'downshift'
import { AnimatePresence, motion } from 'framer-motion'

import type { Theme } from '@oxide/theme'
import { Icon } from '../icon/Icon'
import { Text } from '../text/Text'

type SizeType = 'xs' | 'sm' | 'lg'
type OptionType = { value: string; label: string }
export interface DropdownProps {
  defaultValue?: string
  /**
   * Additional text to associate with this specific field
   */
  hint?: string | React.ReactNode
  /**
   * Required for accessibility. Description of the dropdown.
   */
  label: string
  options: OptionType[]
  /**
   * Text that initially appears in the Button when nothing is selected
   */
  placeholder?: string
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

const getButtonStyles = (size: SizeType) => {
  switch (size) {
    case 'xs':
      return css`
        padding: ${({ theme }) => theme.spacing(2, 3)};

        font-size: ${({ theme }) => theme.spacing(3)};
      `
    default:
    case 'sm':
    case 'lg':
      return css`
        padding: ${({ theme }) => theme.spacing(2, 4)};

        font-size: ${({ theme }) => theme.spacing(4)};
      `
  }
}

type ButtonProps = StyledComponentProps<
  'button',
  Theme,
  { hasPlaceholder: boolean; size: SizeType },
  never
>

const StyledButton = styled.button<ButtonProps>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-top: ${({ theme }) => theme.spacing(1)};
  vertical-align: top;
  width: 100%;

  background-color: ${({ theme }) => theme.color('gray800')};
  border: none;
  color: ${({ theme }) => theme.color('gray50')};

  font-weight: ${({ hasPlaceholder }) => (hasPlaceholder ? 400 : 500)};
  line-height: 1.5;

  ${({ size }) => getButtonStyles(size)};

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
    `${theme.spacing(0, 3, 6)} ${theme.color('black', 0.16)}`};

  list-style: none;

  &:focus {
    box-shadow: ${({ theme }) => `0 0 0 1px ${theme.color('green500')}`};
    outline: none;
  }
`

const getOptionStyles = (size: SizeType) => {
  switch (size) {
    case 'xs':
      return css`
        padding: ${({ theme }) => theme.spacing(2, 3)};

        font-size: ${({ theme }) => theme.spacing(3)};
      `
    case 'lg':
      return css`
        padding: ${({ theme }) => theme.spacing(2.5, 4)};

        font-size: ${({ theme }) => theme.spacing(3.5)};
      `
    default:
    case 'sm':
      return css`
        padding: ${({ theme }) => theme.spacing(1.5, 4)};

        font-size: ${({ theme }) => theme.spacing(3.5)};
      `
  }
}

const StyledOption = styled.li<{ size: SizeType; isHighlighted: boolean }>`
  color: ${({ theme }) => theme.color('gray200')};
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

const HintText = styled(Text).attrs({ size: 'sm' })`
  display: block;
  margin-top: ${({ theme }) => theme.spacing(1)};

  color: ${({ theme }) => theme.color('gray300')};
`

const FRAMER_VARIANTS = {
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

export const Dropdown: FC<DropdownProps> = ({
  defaultValue,
  hint,
  label,
  options,
  placeholder,
  showLabel = true,
  size = 'sm',
}) => {
  const itemToString = (item: OptionType | null) => (item ? item.label : '')
  const select = useSelect({
    initialSelectedItem:
      options.find((option) => option.value === defaultValue) || null,
    items: options,
    itemToString: itemToString,
  })
  const hintId = hint ? `${select.getLabelProps().labelId}-hint` : ``
  const ariaProps = hint ? { 'aria-describedby': hintId } : {}

  const renderLabel = showLabel ? (
    <Label {...select.getLabelProps()}>{label}</Label>
  ) : (
    <VisuallyHidden {...select.getLabelProps()}>{label}</VisuallyHidden>
  )

  const renderButtonText = select.selectedItem
    ? itemToString(select.selectedItem)
    : placeholder
    ? placeholder
    : label

  const renderOptions = options.map((option, index) => (
    <StyledOption
      key={option.value}
      value={option.value}
      size={size}
      {...select.getItemProps({ item: option, index })}
      isHighlighted={select.highlightedIndex === index}
    >
      {option.label}
    </StyledOption>
  ))

  return (
    <Wrapper>
      {renderLabel}
      <StyledButton
        type="button"
        {...select.getToggleButtonProps()}
        hasPlaceholder={select.selectedItem ? false : true}
        size={size}
        {...ariaProps}
      >
        {renderButtonText}
        <StyledIcon />
      </StyledButton>
      <AnimatePresence>
        {select.isOpen && (
          <StyledMenu
            variants={FRAMER_VARIANTS}
            initial={'closed'}
            animate={'open'}
            exit={'closed'}
            {...select.getMenuProps()}
          >
            {renderOptions}
          </StyledMenu>
        )}
      </AnimatePresence>
      {/* if you Tab from menu, focus goes on button, and it shouldn't. only happens here. */}
      <div tabIndex={0} />
      {hint && <HintText id={hintId}>{hint}</HintText>}
    </Wrapper>
  )
}
