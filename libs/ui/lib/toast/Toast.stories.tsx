import { Success16Icon } from '../icons'
import { Toast } from './Toast'

export const Default = () => (
  <Toast
    icon={<Success16Icon />}
    variant="success"
    title="Success!"
    content="7 members have been added."
    onClose={() => alert('onClose')}
  />
)
