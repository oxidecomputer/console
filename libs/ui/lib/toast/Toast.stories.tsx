import { Success12Icon } from '../icons'
import { Toast } from './Toast'

export const Default = () => (
  <Toast
    icon={<Success12Icon />}
    variant="success"
    title="Success!"
    content="7 members have been added."
    onClose={() => alert('onClose')}
  />
)
