import {
  FloatingPortal,
  arrow,
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

export interface TooltipProps {
  id: string
  children?: React.ReactNode
  /** The text to appear on hover/focus */
  content: string | React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  definition?: boolean
  placement: Placement
}

const flipPlacement = (placement: Placement): Placement => {
  if (placement.startsWith('top')) return placement.replace('top', 'bottom') as Placement
  if (placement.startsWith('bottom')) return placement.replace('bottom', 'top') as Placement
  if (placement.startsWith('left')) return placement.replace('left', 'right') as Placement
  if (placement.startsWith('right')) return placement.replace('right', 'left') as Placement
  return placement
}

export const Tooltip = ({
  children,
  content,
  placement,
  definition = false,
}: TooltipProps) => {
  const [open, setOpen] = useState(false)
  const arrowRef = useRef(null)

  const { x, y, reference, floating, strategy, context, middlewareData } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [flip(), offset(12), arrow({ element: arrowRef, padding: 12 })],
  })

  const hover = useHover(context, { move: false })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const { x: arrowX, y: arrowY } = middlewareData.arrow || {}
  const shouldFlip = !!middlewareData.flip?.overflows

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
              data-placement={shouldFlip ? flipPlacement(placement) : placement}
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
