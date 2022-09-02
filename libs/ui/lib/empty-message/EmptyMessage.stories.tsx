import { Instances24Icon } from '../icons'
import { EmptyMessage } from './EmptyMessage'

export const Default = () => (
  <EmptyMessage
    icon={<Instances24Icon />}
    title="No instances"
    body="You need to create an instance to be able to see it here"
    buttonText="New instance"
    buttonTo="new"
  />
)
