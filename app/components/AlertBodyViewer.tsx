/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { memo, useMemo } from 'react'

import { snakeify } from '@oxide/api'

import { HighlightJSON } from '~/components/HighlightJSON'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { SideModal } from '~/ui/lib/SideModal'

/**
 * Highlighted, copyable view of an alert's data payload for side modals. Keys
 * are snake_case to match the alert as the API and the webhook payload present
 * it.
 */
export const AlertBodyViewer = memo(({ body }: { body: Record<string, unknown> }) => {
  // recomputing on every render would hand HighlightJSON a new object each
  // time and defeat its memo
  const snakeJson = useMemo(() => snakeify(body), [body])
  const stringified = useMemo(() => JSON.stringify(snakeJson, null, 2), [snakeJson])
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SideModal.Heading>Alert body</SideModal.Heading>
        <CopyToClipboard text={stringified} ariaLabel="Copy alert body" />
      </div>
      <div className="bg-raise border-secondary overflow-x-auto rounded border px-3 py-2">
        <pre className="text-mono-code [font-size:13px]! [line-height:18px]!">
          <HighlightJSON json={snakeJson} />
        </pre>
      </div>
    </div>
  )
})
