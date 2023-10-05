/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { AvatarProps, AvatarSize } from '../avatar/Avatar'
import { Avatar } from '../avatar/Avatar'

export interface AvatarStackProps {
  data: Array<AvatarProps>
  size?: AvatarSize
}

export const AvatarStack = ({ data, size = 'base' }: AvatarStackProps) => (
  <div className="flex">
    {data.map((avatarProps) => (
      <Avatar
        className="-ml-2 ring-2 ring-surface"
        key={`avatar-stack-${avatarProps.name}`}
        size={size}
        {...avatarProps}
      />
    ))}
  </div>
)
