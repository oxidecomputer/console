/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { CopyToClipboard } from './CopyToClipboard'

export const Default = () => (
  <div>
    <div className="flex items-center gap-2">
      <span>This is the text to be copied.</span>
      <CopyToClipboard text="This is the text to be copied." />
    </div>
    <div className="flex items-center gap-2">
      <span>Though you can copy whatever you like …</span>
      <CopyToClipboard text="Just put it in the component’s `text` prop." />
    </div>
  </div>
)
