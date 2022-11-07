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
import { useRef, useState } from 'react'

// import { mergeRefs } from 'react-merge-refs'
import './tooltip.css'

/**
 * This component allows either auto or manual placement of the tooltip. When `auto` is used, the
 * tooltip will be placed in the best position based on the available space. When any other placement
 * is used, the tooltip will be placed in that position but will also be flipped if there is not enough
 * space for it to be displayed in that position.
 */
type PlacementOrAuto = Placement | 'auto'

export interface TooltipProps {
  id: string
  children?: React.ReactNode
  /** The text to appear on hover/focus */
  content: string | React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  definition?: boolean
  /** Defaults to auto if not supplied */
  placement?: PlacementOrAuto
}

export const Tooltip = ({
  children,
  content,
  placement = 'auto',
  definition = false,
}: TooltipProps) => {
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
       * `autoPlacement` and `flip` are mututally excusive behaviors. If we manually provide a placement we want to make sure
       * it flips to the other side if there is not enough space for it to be displayed in that position.
       */
      placement === 'auto' ? autoPlacement() : flip(),
      offset(12),
      arrow({ element: arrowRef, padding: 12 }),
    ],
  })

  const hover = useHover(context, { move: false })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const { x: arrowX, y: arrowY } = middlewareData.arrow || {}

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ])

  return (
    <>
      <button
        type="button"
        ref={reference}
        {...getReferenceProps()}
        className={cn('svg:pointer-events-none', {
          'dashed-underline': definition,
        })}
      >
        {children}
      </button>
      <FloatingPortal>
        {open && (
          <>
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
          </>
        )}
      </FloatingPortal>
    </>
  )
}
