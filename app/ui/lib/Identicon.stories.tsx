/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Identicon } from './Identicon'

export const Default = () => (
  <div className="space-y-4">
    <p>Note that similar names do not have similar icons</p>
    <div>
      <h1 className="mb-2 text-sans-xl">org1</h1>
      <Identicon name="org1" />
    </div>
    <div>
      <h1 className="mb-2 text-sans-xl">org2</h1>
      <Identicon name="org2" />
    </div>
    <div>
      <h1 className="mb-2 text-sans-xl">
        some-other-org (with <code>className</code> for styling)
      </h1>
      <Identicon
        className="bg-green-900 text-green-500 flex h-[34px] w-[34px] items-center justify-center rounded"
        name="some-other-org"
      />
    </div>
  </div>
)
