/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Button } from '~/ui/lib/Button'

type ClearAndAddButtonsProps = {
  addButtonCopy: string
  onClear: () => void
  onSubmit: () => void
  isDirty: boolean
}

/**
 * A set of buttons used with embedded sub-forms to add items to MiniTables,
 * like in the firewall rules and NIC edit forms.
 */
export const ClearAndAddButtons = ({
  addButtonCopy,
  onClear,
  onSubmit,
  isDirty,
}: ClearAndAddButtonsProps) => (
  <div className="flex justify-end gap-2.5">
    <Button variant="ghost" size="sm" disabled={!isDirty} onClick={onClear}>
      Clear
    </Button>
    <Button size="sm" onClick={onSubmit}>
      {addButtonCopy}
    </Button>
  </div>
)
