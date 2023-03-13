import { useState } from 'react'

import { Clipboard16Icon, Success12Icon } from '../icons'
import { Tooltip } from '../tooltip/Tooltip'

type TruncatePosition = 'middle' | 'end'

interface TruncateProps {
  text: string
  maxLength: number
  position?: TruncatePosition
  hasCopyButton?: boolean
}

export const Truncate = ({
  text,
  maxLength,
  position = 'end',
  hasCopyButton,
}: TruncateProps) => {
  const [hasCopied, setHasCopied] = useState(false)
  if (text.length <= maxLength) {
    return <div>{text}</div>
  }

  const handleCopy = () => {
    window.navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true)

      // Unset hasCopied to revert back to the clipboard icon
      setTimeout(() => {
        setHasCopied(false)
      }, 2000)
    })
  }

  // Only use the tooltip if the text is longer than maxLength
  return (
    <div className="flex items-center space-x-2">
      <Tooltip content={text}>
        <div>{truncate(text, maxLength, position)}</div>
      </Tooltip>
      {hasCopyButton &&
        (hasCopied ? (
          <Success12Icon className="text-accent-secondary" />
        ) : (
          <button
            className="text-tertiary hover:text-accent-secondary"
            onClick={handleCopy}
          >
            <Clipboard16Icon className="h-3 w-3" />
          </button>
        ))}
    </div>
  )
}

export function truncate(text: string, maxLength: number, position?: TruncatePosition) {
  if (text.length <= maxLength) {
    return text
  }

  let newText = text

  // We remove a little to compensate for the extra width
  // added by the ellipse character
  const truncateAmount = maxLength - 2

  if (position === 'end' || !position) {
    newText = `${text.substring(0, truncateAmount)}…`
  } else {
    const halfLength = Math.floor(truncateAmount / 2)
    newText = `${text.substring(0, halfLength)}…${text.substring(
      text.length - halfLength,
      text.length
    )}`
  }

  return newText
}
