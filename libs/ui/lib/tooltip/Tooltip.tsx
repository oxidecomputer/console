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
} from '@floating-ui/react'
import type { Placement } from '@floating-ui/react'
import cn from 'classnames'
import type { ReactElement } from 'react'
import { Children, cloneElement, forwardRef, useRef, useState } from 'react'
import { mergeRefs } from 'react-merge-refs'

import './tooltip.css'

export interface TooltipProps {
  delay?: number
  children?: React.ReactNode
  /** The text to appear on hover/focus */
  content: string | React.ReactNode
  /**
   * `undefined` means automatic, which means the tooltip will be placed in the
   * best position based on the available space. When any other placement is
   * used, the tooltip will be placed in that position but will also be flipped
   * if there is not enough space for it to be displayed in that position.
   */
  placement?: Placement
}

export const Tooltip = forwardRef(
  ({ delay = 250, children, content, placement }: TooltipProps, elRef) => {
    const [open, setOpen] = useState(false)
    const arrowRef = useRef(null)
    console.count('render')

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
      placement,
      whileElementsMounted: autoUpdate,
      middleware: [
        /**
         * `autoPlacement` and `flip` are mutually excusive behaviors. If we
         * manually provide a placement we want to make sure it flips to the
         * other side if there is not enough space for it to be displayed in
         * that position.
         */
        placement ? flip() : autoPlacement(),
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

    const child = cloneElement(Children.only(children) as ReactElement, {
      ...getReferenceProps(),
      ref: mergeRefs([reference, elRef]),
    })

    return (
      <>
        {child}
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
      </>
    )
  }
)
