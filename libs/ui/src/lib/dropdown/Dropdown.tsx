import type { FC } from 'react'
import React from 'react'
import cn from 'classnames'

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
        className={cn(
          'py-2 px-4 text-sm text-gray-50 hover:bg-gray-400 focus:bg-gray-400 focus:ring-1 focus:ring-green-500',
          size === 'lg' && 'py-2.5',
          highlighted && 'bg-gray-400'
        )}
        key={option.value}
        value={option.value}
        {...select.getItemProps({ item: option, index })}
      >
        {option.label}
      </li>
    )
  })

  return (
    <div className="relative">
      <label
        className={showLabel ? 'text-white text-sm' : 'sr-only'}
        {...select.getLabelProps()}
      >
        {label}
      </label>
      <button
        className={`flex items-center justify-between mt-1 py-2 px-4 w-full
          text-base text-white bg-gray-400 hover:bg-gray-400
          focus:ring-1 focus:ring-green-500`}
        type="button"
        {...select.getToggleButtonProps()}
        {...ariaProps}
      >
        {renderButtonText}
        <Icon name="chevron" className="ml-5 transform -rotate-90" />
      </button>
      <AnimatePresence>
        {select.isOpen && (
          <motion.ul
            className="z-10 py-2 mt-1 absolute left-0 right-0 overflow-y-auto bg-gray-500 focus:ring-1 focus:ring-green-500"
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
      {hint && (
        <div id={hintId} className="text-sm mt-1 text-gray-50">
          {hint}
        </div>
      )}
    </div>
  )
}
