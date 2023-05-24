import type { Node } from '@react-types/shared'
import cn from 'classnames'
import { useRef } from 'react'
import { useOption } from 'react-aria'
import type { ListState } from 'react-stately'

interface OptionProps {
  item: Node<unknown>
  state: ListState<unknown>
}

export function Option({ item, state }: OptionProps) {
  const ref = useRef<HTMLLIElement>(null)
  const { optionProps, isDisabled, isSelected, isFocused } = useOption(
    {
      key: item.key,
    },
    state,
    ref
  )

  return (
    <li
      {...optionProps}
      ref={ref}
      className="relative border-b !outline-none border-secondary last:border-0"
    >
      <div
        className={cn(
          'ox-menu-item',
          isFocused && 'is-highlighted',
          isSelected && 'is-selected',
          isDisabled && 'is-disabled'
        )}
      >
        {item.rendered}
      </div>
    </li>
  )
}
