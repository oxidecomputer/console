import { AvatarStack } from './AvatarStack'

export default {
  component: AvatarStack,
}

const AVATAR_DATA = [
  { name: 'Haley Clark', round: true },
  { name: 'Cameron Howe', round: true },
  { name: 'Gordon Clark', round: true },
]

export const Default = {
  args: { data: AVATAR_DATA },
}
