/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Filter12Icon } from '../icons'
import { Tooltip } from './Tooltip'

export const Default = () => (
  <>
    <Tooltip content="Filter">
      <button>
        <Filter12Icon />
      </button>
    </Tooltip>
  </>
)
