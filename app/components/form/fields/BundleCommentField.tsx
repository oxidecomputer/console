/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Control } from 'react-hook-form'

import { MAX_BUNDLE_COMMENT_BYTES, utf8ByteLength } from '@oxide/api'

import { TextField } from './TextField'

/** Support bundle comment textarea, shared by the create and edit forms */
export function BundleCommentField({
  control,
}: {
  control: Control<{ userComment: string }>
}) {
  return (
    <TextField
      as="textarea"
      name="userComment"
      label="Comment"
      rows={4}
      control={control}
      validate={(value) =>
        utf8ByteLength(value) > MAX_BUNDLE_COMMENT_BYTES
          ? `Comment cannot exceed ${MAX_BUNDLE_COMMENT_BYTES} bytes`
          : true
      }
    />
  )
}
