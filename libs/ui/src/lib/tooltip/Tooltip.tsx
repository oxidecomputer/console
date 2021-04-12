import type { FC } from 'react'
import React, { useRef, useState, useEffect, useCallback } from 'react'

import styled, { css } from 'styled-components'
import { usePopper } from 'react-popper'

import { Text } from '../text/Text'
import { KEYS } from '../keys-utils'

type Variant = 'base' | 'definition'
export interface TooltipProps {
  content: string | React.ReactNode
  variant?: Variant
  size?: 'sm' | 'lg'
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
    visibility: visible;
    background-color: ${({ theme }) => theme.color('white')};
  }
`

const TooltipButton = styled.button<{ variant: Variant }>`
  ${({ variant }) => {
    if (variant === 'definition') {
      return css`
        border-bottom: 1px dashed #fff;
      `
    }
  }}
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

const TooltipContent = styled(Text).attrs({
  as: 'div',
  size: 'sm',
})`
  padding: ${({ theme }) => theme.spacing(1, 2)};

  background-color: ${({ theme }) => theme.color('white')};
  color: ${({ theme }) => theme.color('gray900')};
`

export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  variant = 'base',
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
      <TooltipButton
        type="button"
        ref={referenceElement}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
        variant={variant}
      >
        {children}
      </TooltipButton>
      <TooltipContainer
        ref={popperElement}
        role="tooltip"
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
