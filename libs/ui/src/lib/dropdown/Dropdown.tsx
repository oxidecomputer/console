import type { FC } from 'react'
import React from 'react'

import tw, { css, styled } from 'twin.macro'
import { useSelect } from 'downshift'
import { AnimatePresence, motion } from 'framer-motion'

import { Icon } from '../icon/Icon'
import { color, spacing } from '@oxide/css-helpers'

type SizeType = 'sm' | 'lg'
type OptionType = { value: string; label: string }
export interface DropdownProps {
  defaultValue?: string
  hint?: string | React.ReactNode
  /**
   * Required for accessibility. Description of the dropdown.
   */
  label: string
  options: OptionType[]
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

type ButtonProps = React.ComponentProps<'button'> & { hasPlaceholder: boolean }

const StyledButton = styled.button<ButtonProps>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-top: ${spacing(1)};
  padding: ${spacing(2, 4)};
  vertical-align: top;
  width: 100%;

  background-color: ${color('gray800')};
  border: none;
  color: ${color('gray50')};
  font-size: ${spacing(4)};

  font-weight: ${({ hasPlaceholder }) => (hasPlaceholder ? 400 : 500)};
  line-height: 1.5;

  &:hover {
    background-color: ${color('gray700')};
  }

  &:focus {
    box-shadow: 0 0 0 1px ${color('green500')};
    outline: none;
  }
`

const StyledMenu = styled(motion.ul)`
  z-index: 1;
  position: absolute;
  left: 0;
  right: 0;

  overflow-y: auto;
  margin: 0;
  margin-top: ${spacing(1)};
  padding: 0;

  background-color: ${color('gray800')};
  box-shadow: ${spacing(0, 3, 6)} ${color('black', 0.16)};

  list-style: none;

  &:focus {
    box-shadow: 0 0 0 1px ${color('green500')};
    outline: none;
  }
`

const getOptionStyles = (size: SizeType) => {
  switch (size) {
    case 'lg':
      return css`
        padding: ${spacing(2.5, 4)};
      `
    default:
    case 'sm':
      return css`
        padding: ${spacing(1.5, 4)};
      `
  }
}

const StyledOption = styled.li<{ size: SizeType; isHighlighted: boolean }>`
  color: ${color('gray200')};
  font-size: ${spacing(3.5)};
  font-weight: 400;
  line-height: 1.5;

  &:hover,
  &:focus {
    background-color: ${color('gray700')};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 1px ${color('green500')};
  }

  &:first-of-type {
    margin-top: ${spacing(2)};
  }

  &:last-child {
    margin-bottom: ${spacing(2)};
  }

  ${({ size }) => getOptionStyles(size)};
  ${({ isHighlighted }) =>
    isHighlighted &&
    css`
      background-color: ${color('gray700')};
    `};
`

const HintText = tw.div`text-sm mt-1 text-gray-300`

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
      <label
        css={showLabel ? tw`text-white text-sm` : tw`sr-only`}
        {...select.getLabelProps()}
      >
        {label}
      </label>
      <StyledButton
        type="button"
        hasPlaceholder={!select.selectedItem}
        {...select.getToggleButtonProps()}
        {...ariaProps}
      >
        {renderButtonText}
        <Icon name="chevron" rotate="270deg" tw="ml-5" />
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
