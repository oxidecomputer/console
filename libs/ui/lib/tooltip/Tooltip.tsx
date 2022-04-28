import type { FC } from 'react'
import { useRef, useState, useEffect, useCallback } from 'react'
import cn from 'classnames'

import { usePopper } from 'react-popper'

import './tooltip.css'
import { KEYS } from '../../util/keys'

export interface TooltipProps {
  id: string
  children?: React.ReactNode
  /** The text to appear on hover/focus */
  content: string | React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  definition?: boolean
}

const ARROW_SIZE = 12

export const Tooltip: FC<TooltipProps> = ({
  id,
  children,
  content,
  onClick,
  definition = false,
}) => {
  const referenceElement = useRef(null)
  const popperElement = useRef(null)
  const arrowElement = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  const { attributes, styles, update } = usePopper(
    referenceElement.current,
    popperElement.current,
    {
      modifiers: [
        { name: 'arrow', options: { element: arrowElement.current } },
        {
          name: 'offset',
          options: {
            offset: [0, ARROW_SIZE],
          },
        },
        // disable eventListeners when closed for optimization
        // (could make difference with many Tooltips on a single page)
        { name: 'eventListeners', enabled: isOpen },
      ],
    }
  )

  const openTooltip = () => {
    setIsOpen(true)
    if (update) {
      // Update popper position
      // (position will need to update after scrolling, for example)
      update()
    }
  }
  const closeTooltip = useCallback(() => setIsOpen(false), [setIsOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event
      switch (key) {
        case KEYS.escape:
          event.preventDefault()
          // Close tooltip on escape
          closeTooltip()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return function cleanup() {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeTooltip])

  return (
    <>
      <button
        type="button"
        ref={referenceElement}
        onClick={onClick}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
        className={cn('mt-[2px] h-4 svg:pointer-events-none svg:align-top', {
          'dashed-underline': definition,
        })}
      >
        {children}
      </button>
      <div
        className={cn('TooltipContainer', isOpen ? 'block' : 'hidden')}
        ref={popperElement}
        role="tooltip"
        id={id}
        style={styles.popper}
        {...attributes.popper}
      >
        <div className="rounded border py-1 px-2 text-sans-sm text-default bg-raise border-secondary">
          {content}
        </div>
        <div className="TooltipArrow" ref={arrowElement} style={styles.arrow} />
      </div>
    </>
  )
}
