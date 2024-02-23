/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { BulkActionMenu } from './BulkActionMenu'

export const Default = () => (
  <BulkActionMenu selectedCount={5} onSelectAll={() => alert('selected all')}>
    <BulkActionMenu.Button>Delete</BulkActionMenu.Button>
    <BulkActionMenu.Button>Edit</BulkActionMenu.Button>
    <BulkActionMenu.Button>More</BulkActionMenu.Button>
  </BulkActionMenu>
)
