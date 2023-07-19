/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Avatar } from './Avatar'

export const Default = () => <Avatar name="Cameron Howe" round />

export const Selected = () => (
  <div className="is-selected -m-4 p-4 bg-accent-secondary">
    <Avatar name="Cameron Howe" round />
  </div>
)
