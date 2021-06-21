import type { FC } from 'react'
import React from 'react'

import tw, { css, theme } from 'twin.macro'
import { useSelect } from 'downshift'
import { AnimatePresence, motion } from 'framer-motion'

import { Icon } from '../icon/Icon'

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

const focusRing = css`
  &:focus {
    outline: none;
    box-shadow: 0 0 0 1px ${theme`colors.green.DEFAULT`};
  }
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

  const renderOptions = options.map((option, index) => {
    const highlighted = select.highlightedIndex === index
    return (
      <li
        tw="py-2 px-4 text-sm text-gray-200 hocus:bg-gray-700"
        key={option.value}
        value={option.value}
        {...select.getItemProps({ item: option, index })}
        css={[
          focusRing,
          size === 'lg' && tw`py-2.5`,
          highlighted && tw`bg-gray-700`,
        ]}
      >
        {option.label}
      </li>
    )
  })

  return (
    <div tw="relative">
      <label
        css={showLabel ? tw`text-white text-sm` : tw`sr-only`}
        {...select.getLabelProps()}
      >
        {label}
      </label>
      <button
        tw="flex items-center justify-between mt-1 py-2 px-4 w-full
            text-base text-gray-50 bg-gray-800 hover:bg-gray-700"
        css={focusRing}
        type="button"
        {...select.getToggleButtonProps()}
        {...ariaProps}
      >
        {renderButtonText}
        <Icon name="chevron" tw="ml-5 transform -rotate-90" />
      </button>
      <AnimatePresence>
        {select.isOpen && (
          <motion.ul
            tw="z-10 py-2 mt-1 absolute left-0 right-0 overflow-y-auto bg-gray-800"
            css={focusRing}
            variants={FRAMER_VARIANTS}
            initial={'closed'}
            animate={'open'}
            exit={'closed'}
            {...select.getMenuProps()}
          >
            {renderOptions}
          </motion.ul>
        )}
      </AnimatePresence>
      {/* if you Tab from menu, focus goes on button, and it shouldn't. only happens here. */}
      <div tabIndex={0} />
      {hint && <HintText id={hintId}>{hint}</HintText>}
    </div>
  )
}
