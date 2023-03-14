import {
  FloatingPortal,
  arrow,
  autoPlacement,
  autoUpdate,
  flip,
  offset,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react-dom-interactions'
import type { Placement } from '@floating-ui/react-dom-interactions'
import cn from 'classnames'
import type { ReactElement } from 'react'
import { forwardRef } from 'react'
import { cloneElement } from 'react'
import { Children } from 'react'
import { useRef, useState } from 'react'
import { mergeRefs } from 'react-merge-refs'
import invariant from 'tiny-invariant'

import './tooltip.css'

/**
 * This component allows either auto or manual placement of the tooltip. When `auto` is used, the
 * tooltip will be placed in the best position based on the available space. When any other placement
 * is used, the tooltip will be placed in that position but will also be flipped if there is not enough
 * space for it to be displayed in that position.
 */
type PlacementOrAuto = Placement | 'auto'

export interface UseTooltipOptions {
  /** Text to be rendered inside the tooltip */
  content: string | React.ReactNode
  /** Defaults to auto if not supplied */
  placement?: PlacementOrAuto
  delay?: number
}
export const useTooltip = ({ delay = 250, content, placement }: UseTooltipOptions) => {
  const [open, setOpen] = useState(false)
  const arrowRef = useRef(null)

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    context,
    placement: finalPlacement,
    middlewareData,
  } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: placement === 'auto' ? undefined : placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      /**
       * `autoPlacement` and `flip` are mutually excusive behaviors. If we manually provide a placement we want to make sure
       * it flips to the other side if there is not enough space for it to be displayed in that position.
       */
      placement === 'auto' ? autoPlacement() : flip(),
      offset(12),
      arrow({ element: arrowRef, padding: 12 }),
    ],
  })

  const { x: arrowX, y: arrowY } = middlewareData.arrow || {}

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false, delay: { open: delay, close: 0 } }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: 'tooltip' }),
  ])

  return {
    /**
     * Ref to be added to the anchor element of the tooltip. Use
     * `react-merge-refs` if more than one ref is required for the element.
     * */
    ref: reference,
    /** Props to be passed to the anchor element of the tooltip */
    props: getReferenceProps(),
    Tooltip: () => (
      <FloatingPortal>
        {open && (
          <div
            ref={floating}
            style={{ position: strategy, top: y ?? 0, left: x ?? 0 }}
            className={cn('ox-tooltip max-content')}
            /** Used to ensure the arrow is styled correctly */
            data-placement={finalPlacement}
            {...getFloatingProps()}
          >
            {content}
            <div
              className="ox-tooltip-arrow"
              ref={arrowRef}
              style={{ left: arrowX, top: arrowY }}
            />
          </div>
        )}
      </FloatingPortal>
    ),
  }
}
export interface TooltipProps {
  delay?: number
  children?: React.ReactNode
  /** The text to appear on hover/focus */
  content: string | React.ReactNode
  /** Defaults to auto if not supplied */
  placement?: PlacementOrAuto
}

export const Tooltip = forwardRef(
  ({ delay, children, content, placement = 'auto' }: TooltipProps, elRef) => {
    const { ref, props, Tooltip: TooltipPopup } = useTooltip({ content, placement, delay })

    let child = Children.only(children)
    invariant(child, 'Tooltip must have a single child')
    child = cloneElement(child as ReactElement, {
      ...props,
      ref: mergeRefs([ref, elRef]),
    })

    return (
      <>
        {child}
        <TooltipPopup />
      </>
    )
  }
)
