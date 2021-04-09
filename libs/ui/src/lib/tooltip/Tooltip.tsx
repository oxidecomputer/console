import type { FC } from 'react'
import React, { useState } from 'react'

import styled from 'styled-components'
import { usePopper } from 'react-popper'

export interface TooltipProps {
  size?: 'sm' | 'lg'
}

const TooltipButton = styled.button``

const TooltipContent = styled.div``

export const Tooltip: FC<TooltipProps> = () => {
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const [arrowElement, setArrowElement] = useState(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
  })

  return (
    <>
      <TooltipButton type="button" ref={setReferenceElement}>
        Reference element
      </TooltipButton>

      <TooltipContent
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        role="tooltip"
      >
        Popper element
        <div ref={setArrowElement} style={styles.arrow} />
      </TooltipContent>
    </>
  )
}
