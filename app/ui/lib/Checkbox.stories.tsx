/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Checkbox } from './Checkbox'

export const All = () => {
  return (
    <div className="flex flex-col space-y-2">
      <Checkbox>default</Checkbox>
      <Checkbox className=":hover">hover</Checkbox>
      <Checkbox className=":focus">focus</Checkbox>
      <Checkbox checked>selected</Checkbox>
      <Checkbox indeterminate>partial</Checkbox>
      <Checkbox indeterminate className=":hover">
        hover, partial
      </Checkbox>
      <Checkbox indeterminate className=":focus">
        focus, partial
      </Checkbox>
      <Checkbox checked className=":hover">
        hover, selected
      </Checkbox>
      <Checkbox checked className=":focus">
        focus, selected
      </Checkbox>
    </div>
  )
}

export const Selected = () => {
  return (
    <div className="is-selected -m-4 p-4 bg-accent-secondary">
      <All />
    </div>
  )
}

// export const Unchecked: Story = {
//   args: { checked: false, indeterminate: false, children: 'Label' },
// }
// export const Checked: Story = {
//   args: { checked: true, indeterminate: false, children: 'Label' },
// }
// export const Indeterminate: Story = {
//   args: { checked: false, indeterminate: true, children: 'Label' },
// }
// export const NoLabel: Story = {
//   args: { checked: false, indeterminate: false },
// }
