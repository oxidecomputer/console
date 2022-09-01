import { Avatar } from './Avatar'

export const Default = () => <Avatar name="Cameron Howe" round />

export const Selected = () => (
  <div className="is-selected -m-4 p-4 bg-accent-secondary">
    <Avatar name="Cameron Howe" round />
  </div>
)
