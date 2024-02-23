/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Truncate } from './Truncate'

export const Default = () => (
  <div className="space-y-4">
    <Truncate text="document.getElementById(foo).innerHTML" maxLength={30} />
    <Truncate
      text="document.getElementById(foo).innerHTML"
      maxLength={30}
      position="middle"
    />
    <Truncate
      text="document.getElementById(foo).innerHTML"
      maxLength={30}
      position="middle"
      hasCopyButton
    />
    <Truncate text="document.getElementById(foo).innerHTML" maxLength={100} />
  </div>
)
