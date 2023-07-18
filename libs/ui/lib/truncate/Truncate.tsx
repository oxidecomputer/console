/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import useTimeout from '../hooks/use-timeout'
import { Clipboard16Icon, Success12Icon } from '../icons'
import { Tooltip } from '../tooltip/Tooltip'

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
  const [hasCopied, setHasCopied] = useState(false)

  useTimeout(() => setHasCopied(false), hasCopied ? 2000 : null)

  if (text.length <= maxLength) {
    return <div>{text}</div>
  }

  const handleCopy = () => {
    window.navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true)
    })
  }

  // Only use the tooltip if the text is longer than maxLength
  return (
    <div className="flex items-center space-x-2">
      <Tooltip content={text} delay={tooltipDelay}>
        <div aria-label={text}>{truncate(text, maxLength, position)}</div>
      </Tooltip>
      {hasCopyButton &&
        (hasCopied ? (
          <Success12Icon className="text-accent-secondary" />
        ) : (
          <button
            className="text-tertiary hover:text-accent-secondary"
            onClick={handleCopy}
            type="button"
          >
            <Clipboard16Icon className="h-3 w-3" />
          </button>
        ))}
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
