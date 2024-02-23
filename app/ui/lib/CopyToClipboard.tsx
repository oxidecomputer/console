/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { animated, config, useTransition } from '@react-spring/web'
import cn from 'classnames'
import { useState } from 'react'

import { Copy12Icon, Success12Icon, useTimeout } from '@oxide/ui'

export const CopyToClipboard = ({
  ariaLabel = 'Click to copy this text',
  text,
}: {
  ariaLabel?: string
  text: string
}) => {
  const [hasCopied, setHasCopied] = useState(false)

  useTimeout(() => setHasCopied(false), hasCopied ? 2000 : null)

  const handleCopy = () => {
    window.navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true)
    })
  }

  const transitions = useTransition(hasCopied, {
    from: { opacity: 0, transform: 'scale(0.8)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.8)' },
    config: config.stiff,
    trail: 100,
    initial: null,
  })

  return (
    <button
      className={cn(
        'relative h-5 w-5 rounded',
        hasCopied
          ? 'text-accent bg-accent-secondary'
          : 'text-quaternary hover:text-secondary hover:bg-hover'
      )}
      onClick={handleCopy}
      type="button"
      aria-label={hasCopied ? 'Copied' : ariaLabel}
    >
      {transitions((styles, item) => (
        <animated.div
          style={styles}
          className="absolute inset-0 flex items-center justify-center"
        >
          {item ? <Success12Icon /> : <Copy12Icon />}
        </animated.div>
      ))}
    </button>
  )
}
