/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  arrow,
  autoPlacement,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  type Placement,
} from '@floating-ui/react'
import cn from 'classnames'
import { Children, cloneElement, useRef, useState, type ReactElement } from 'react'

import { usePopoverZIndex } from './SideModal'

export interface TooltipProps {
  delay?: number
  // Specify ref prop because we use it below when we inject the tooltip ref
  // into the button child. If we don't do this, the library cannot find the
  // button on the page in order to place the tooltip next to it; it lands in
  // the corner at (0,0).

  /** The target the tooltip hovers near; can not be a raw string. */
  children?: ReactElement<{ ref?: React.Ref<HTMLButtonElement> }>
  /** The text to appear on hover/focus */
  content?: string | React.ReactNode
  /**
   * `undefined` means automatic, which means the tooltip will be placed in the
   * best position based on the available space. When any other placement is
   * used, the tooltip will be placed in that position but will also be flipped
   * if there is not enough space for it to be displayed in that position.
   */
  placement?: Placement
}

export const Tooltip = ({ delay = 250, children, content, placement }: TooltipProps) => {
  const [open, setOpen] = useState(false)
  const arrowRef = useRef(null)

  const { refs, floatingStyles, context } = useFloating({
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
      shift({ padding: 16 }),
      arrow({ element: arrowRef, padding: 12 }),
    ],
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false, delay: { open: delay, close: 0 } }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: 'tooltip' }),
  ])

  const onlyChild = Children.only(children)!
  const child = cloneElement(onlyChild, {
    ...getReferenceProps(),
    // merge with whatever ref is already on the button
    ref: useMergeRefs([refs.setReference, onlyChild.props.ref]),
  })

  const zIndex = usePopoverZIndex()

  if (!content) return child

  return (
    <>
      {child}
      <FloatingPortal>
        {open && (
          <div
            ref={refs.setFloating}
            className={cn('ox-tooltip max-content max-w-sm', zIndex)}
            {...getFloatingProps()}
            style={floatingStyles}
          >
            {content}
            <FloatingArrow
              width={12}
              height={8}
              strokeWidth={1}
              tipRadius={2}
              stroke="var(--stroke-secondary)"
              fill="var(--surface-raise)"
              ref={arrowRef}
              context={context}
            />
          </div>
        )}
      </FloatingPortal>
    </>
  )
}
