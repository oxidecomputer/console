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
    <p>
      Note that the text rendered on the screen is independent of the text copied to the
      clipboard …
    </p>
    <div className="flex items-center gap-2">
      <span>This text, for example, is different from the text that’ll be copied …</span>
      <CopyToClipboard
        text="Clicking this button will copy the text you are currently reading"
        ariaLabel="You can customize the ariaLabel for the prompt to copy"
      />
    </div>
  </div>
)
