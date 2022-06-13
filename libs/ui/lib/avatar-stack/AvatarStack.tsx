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
