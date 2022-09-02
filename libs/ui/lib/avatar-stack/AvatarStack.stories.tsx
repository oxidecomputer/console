import { AvatarStack } from './AvatarStack'

const AVATAR_DATA = [
  { name: 'Haley Clark', round: true },
  { name: 'Cameron Howe', round: true },
  { name: 'Gordon Clark', round: true },
]

export const Default = () => <AvatarStack data={AVATAR_DATA} />

export const Selected = () => (
  <div className="is-selected -m-4 p-4 bg-accent-secondary">
    <AvatarStack data={AVATAR_DATA} />
  </div>
)
