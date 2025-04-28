/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import * as DropdownMenu from '~/ui/lib/DropdownMenu'

export function CopyIdItem({ id, label = 'Copy ID' }: { id: string; label?: string }) {
  return (
    <DropdownMenu.Item
      onSelect={() => window.navigator.clipboard.writeText(id)}
      label={label}
    />
  )
}
