/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import cn from 'classnames'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useState } from 'react'

import { Copy12Icon, Success12Icon } from '@oxide/design-system/icons/react'

import { useTimeout } from './use-timeout'

type Props = {
  ariaLabel?: string
  text: string
  className?: string
}

const variants = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: { opacity: 1, scale: 1 },
}

export const CopyToClipboard = ({
  ariaLabel = 'Click to copy',
  text,
  className,
}: Props) => {
  const [hasCopied, setHasCopied] = useState(false)

  useTimeout(() => setHasCopied(false), hasCopied ? 2000 : null)

  const handleCopy = () => {
    window.navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true)
    })
  }

  const animateProps = {
    className: 'absolute inset-0 flex items-center justify-center',
    variants,
    initial: 'hidden',
    animate: 'visible',
    exit: 'hidden',
    transition: { type: 'spring', duration: 0.2, bounce: 0 },
  }

  return (
    <button
      className={cn(
        'relative h-5 w-5 rounded',
        hasCopied
          ? 'text-accent bg-accent-secondary'
          : 'text-tertiary hover:text-default hover:bg-hover',

        className
      )}
      onClick={handleCopy}
      type="button"
      aria-label={hasCopied ? 'Copied' : ariaLabel}
    >
      <AnimatePresence mode="wait" initial={false}>
        {hasCopied ? (
          <m.span key="checkmark" {...animateProps}>
            <Success12Icon />
          </m.span>
        ) : (
          <m.span key="copy" {...animateProps}>
            <Copy12Icon />
          </m.span>
        )}
      </AnimatePresence>
    </button>
  )
}
