import type { FC } from 'react'
import React, { useRef, useState, useEffect, useCallback } from 'react'

import styled from 'styled-components'
import { usePopper } from 'react-popper'

import { Text } from '../text/Text'
import { KEYS } from '../keys-utils'

export interface TooltipProps {
  size?: 'sm' | 'lg'
}

const TooltipButton = styled.button``

const TooltipContainer = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`

const TooltipContent = styled(Text).attrs({
  as: 'div',
  size: 'sm',
})`
  padding: ${({ theme }) => theme.spacing(4, 2)};

  background-color: ${({ theme }) => theme.color('white')};
  color: ${({ theme }) => theme.color('gray900')};
`

const ARROW_SIZE = 12

const TooltipArrow = styled.div`
  width: ${ARROW_SIZE}px;
  height: ${ARROW_SIZE}px;
  border: 1px solid red;
  background-color: ${({ theme }) => theme.color('white')};
`

export const Tooltip: FC<TooltipProps> = () => {
  const referenceElement = useRef(null)
  const popperElement = useRef(null)
  const arrowElement = useRef(null)
  const { styles, attributes } = usePopper(
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
      ],
    }
  )
  const [isOpen, setIsOpen] = useState(false)
  const openTooltip = () => setIsOpen(true)
  const closeTooltip = useCallback(() => setIsOpen(false), [setIsOpen])

  useEffect(() => {
    const handleKeyDown: (this: Window, ev: KeyboardEvent) => any = (event) => {
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
      <TooltipButton
        type="button"
        ref={referenceElement}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
      >
        Trigger here
      </TooltipButton>
      <TooltipContainer
        ref={popperElement}
        style={styles.popper}
        {...attributes.popper}
        role="tooltip"
        isOpen={isOpen}
      >
        <TooltipContent>Popper Element</TooltipContent>
        <TooltipArrow ref={arrowElement} style={styles.arrow} />
      </TooltipContainer>
    </>
  )
}
