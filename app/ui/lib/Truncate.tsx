/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { CopyToClipboard } from './CopyToClipboard'
import { Tooltip } from './Tooltip'

type TruncatePosition = 'middle' | 'end'

interface TruncateProps {
  text: string
  maxLength: number
  position?: TruncatePosition
  hasCopyButton?: boolean
  tooltipDelay?: number
}

export const Truncate = ({
  text,
  maxLength,
  position = 'end',
  hasCopyButton,
  tooltipDelay = 300,
}: TruncateProps) => {
  if (text.length <= maxLength) {
    return <div>{text}</div>
  }

  // Only use the tooltip if the text is longer than maxLength
  return (
    // overflow-hidden required to make inner truncate work
    <div className="flex items-center gap-0.5 overflow-hidden">
      <Tooltip content={text} delay={tooltipDelay}>
        <div aria-label={text} className="truncate">
          {truncate(text, maxLength, position)}
        </div>
      </Tooltip>
      <div className="flex items-center p-0.5">
        {hasCopyButton && <CopyToClipboard text={text} />}
      </div>
    </div>
  )
}

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
