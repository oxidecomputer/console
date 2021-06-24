import type { FC } from 'react'
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'

import tw, { styled } from 'twin.macro'
import { usePopper } from 'react-popper'
import { v4 as uuid } from 'uuid'

import { KEYS } from '../keys-utils'

export interface TooltipProps {
  /** Required. Let screen readers know whether this is the primary label or an auxiliary description. */
  isPrimaryLabel: boolean
  children?: React.ReactNode
  /** The text to appear on hover/focus */
  content: string | React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  definition?: boolean
}

const ARROW_SIZE = 12

const TooltipArrow = styled.div`
  visibility: hidden;

  &,
  &:before {
    position: absolute;
    height: ${ARROW_SIZE}px;
    width: ${ARROW_SIZE}px;
  }

  &:before {
    content: '';
    transform: rotate(45deg);
    ${tw`visible bg-grey-400`}
  }
`

const TooltipContainer = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};

  &[data-popper-placement^='top'] > ${TooltipArrow} {
    bottom: ${ARROW_SIZE * -0.5}px;
  }

  &[data-popper-placement^='right'] > ${TooltipArrow} {
    left: ${ARROW_SIZE * -0.5}px;
  }

  &[data-popper-placement^='bottom'] > ${TooltipArrow} {
    top: ${ARROW_SIZE * -0.5}px;
  }

  &[data-popper-placement^='left'] > ${TooltipArrow} {
    right: ${ARROW_SIZE * -0.5}px;
  }
`

const TooltipContent = tw.div`text-sm py-1 px-2 bg-grey-400 text-white`

export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  isPrimaryLabel,
  onClick,
  definition = false,
}) => {
  const referenceElement = useRef(null)
  const popperElement = useRef(null)
  const arrowElement = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const popperId = useMemo(() => uuid(), [])
  const ariaProps = isPrimaryLabel
    ? { 'aria-labelledby': popperId }
    : { 'aria-describedby': popperId }

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
        tw="svg:pointer-events-none"
        css={definition && tw`underline text-decoration-style[dashed]`}
        {...ariaProps}
      >
        {children}
      </button>
      <TooltipContainer
        ref={popperElement}
        role="tooltip"
        id={popperId}
        isOpen={isOpen}
        style={styles.popper}
        {...attributes.popper}
      >
        <TooltipContent>{content}</TooltipContent>
        <TooltipArrow ref={arrowElement} style={styles.arrow} />
      </TooltipContainer>
    </>
  )
}
