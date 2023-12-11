/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useState } from 'react'

import { Clipboard16Icon, Success12Icon, useTimeout } from '@oxide/ui'

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

  return (
    <button
      className="text-tertiary hover:text-accent-secondary"
      onClick={handleCopy}
      type="button"
      aria-label={hasCopied ? 'Copied' : ariaLabel}
    >
      {hasCopied ? (
        <Success12Icon className="text-accent-secondary" />
      ) : (
        <Clipboard16Icon className="h-3 w-3" />
      )}
    </button>
  )
}
