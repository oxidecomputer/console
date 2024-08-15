/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { EmptyCell } from '~/table/cells/EmptyCell'
import { Truncate } from '~/ui/lib/Truncate'

export const DescriptionCell = ({ text }: { text?: string }) =>
  text ? <Truncate text={text} maxLength={48} /> : <EmptyCell />
