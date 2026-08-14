/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import cn from 'classnames'
import { useLayoutEffect, useRef, useState } from 'react'

import { CopyToClipboard } from './CopyToClipboard'
import { Tooltip } from './Tooltip'

type TruncatePosition = 'middle' | 'end'

interface TruncateProps {
  text: string
  position?: TruncatePosition
  hasCopyButton?: boolean
  tooltipDelay?: number
  /**
   * Extra classes for the wrapper, most commonly a `max-w-*` cap on how wide
   * the text can grow. Constrained containers (side modals, toasts) don't need
   * one, but in auto-layout tables the column sizes itself to the text, so
   * table cells need a cap for truncation to ever kick in.
   */
  className?: string
}

export const Truncate = ({
  text,
  position = 'end',
  hasCopyButton,
  tooltipDelay = 300,
  className,
}: TruncateProps) => {
  const ref = useRef<HTMLDivElement>(null)
  // for middle truncation, the ellipsized string; null means the full text fits
  const [middleText, setMiddleText] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)

  // Middle truncation has to be computed up front in order to render at all,
  // and recomputed whenever the container resizes
  useLayoutEffect(() => {
    const el = ref.current
    if (position !== 'middle' || !el) return

    const update = () => {
      const fitted = truncateToFit(text, el)
      setMiddleText(fitted === text ? null : fitted)
      setTruncated(fitted !== text)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text, position])

  // For end truncation, CSS does the actual truncating and the only decision
  // JS makes is whether to show the tooltip — which only matters at hover
  // time. Checking lazily here avoids a per-instance ResizeObserver and can't
  // go stale the way an observer-updated value can between resize and hover.
  const checkEndTruncation =
    position === 'end'
      ? () => {
          const el = ref.current
          if (el) setTruncated(el.scrollWidth > el.clientWidth)
        }
      : undefined

  const inner =
    position === 'end' ? (
      <div ref={ref} aria-label={text} className="truncate">
        {text}
      </div>
    ) : (
      <div
        ref={ref}
        aria-label={text}
        className="relative overflow-hidden whitespace-nowrap"
      >
        {/* invisible copy of the full text keeps the layout width stable, so
            swapping in the shorter ellipsized text can't shrink the container
            and trigger another round of truncation */}
        <span aria-hidden className={cn(middleText && 'invisible')}>
          {text}
        </span>
        {middleText && (
          <span aria-hidden className="absolute inset-0">
            {middleText}
          </span>
        )}
      </div>
    )

  return (
    // overflow-hidden required to make inner truncate work
    <div
      className={cn('flex items-center gap-0.5 overflow-hidden', className)}
      onPointerEnter={checkEndTruncation}
      onFocus={checkEndTruncation}
    >
      {/* Tooltip stays mounted with content gated on `truncated` so its hover
          tracking is already running when the lazy check flips it on. With no
          content it renders just the child. */}
      <Tooltip content={truncated ? text : undefined} delay={tooltipDelay}>
        {inner}
      </Tooltip>
      {hasCopyButton && (
        <div className="flex items-center p-0.5">
          <CopyToClipboard text={text} />
        </div>
      )}
    </div>
  )
}

let canvasCtx: CanvasRenderingContext2D | null = null

/** null in environments without canvas support, like jsdom */
function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (!canvasCtx) canvasCtx = document.createElement('canvas').getContext('2d')
  return canvasCtx
}

/**
 * Middle-truncate `text` to fit the rendered width of `el`, measuring
 * candidate strings with canvas `measureText`, which accounts for font
 * shaping, kerning, and letter-spacing.
 */
function truncateToFit(text: string, el: HTMLElement): string {
  const ctx = getCanvasCtx()
  // if we can't measure (jsdom) or the element isn't laid out yet, leave it alone
  if (!ctx || el.clientWidth === 0) return text

  const style = getComputedStyle(el)
  // build the font shorthand from parts; `style.font` is empty in Firefox
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing

  const width = el.clientWidth
  if (ctx.measureText(text).width <= width) return text

  const fits = (keep: number) => ctx.measureText(middleEllipsis(text, keep)).width <= width

  // binary search for the largest number of kept characters that fits
  let lo = 0
  let hi = text.length - 1
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (fits(mid)) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }
  return middleEllipsis(text, lo)
}

function middleEllipsis(text: string, keep: number) {
  return (
    text.slice(0, Math.ceil(keep / 2)) +
    '…' +
    text.slice(text.length - Math.floor(keep / 2))
  )
}

/** Truncate `text` to `maxLength` characters. For truncation that adapts to
 * the rendered width instead, use the `Truncate` component. */
export function truncate(
  text: string,
  maxLength: number,
  position: TruncatePosition = 'end'
) {
  if (text.length <= maxLength) return text

  // We remove a little to compensate for the extra width
  // added by the ellipse character
  const truncatedLength = maxLength - 2

  if (position === 'end') {
    return text.substring(0, truncatedLength) + '…'
  }

  const halfLength = Math.floor(truncatedLength / 2)
  const firstHalf = text.substring(0, halfLength)
  const secondHalf = text.substring(text.length - halfLength)
  return `${firstHalf}…${secondHalf}`
}
