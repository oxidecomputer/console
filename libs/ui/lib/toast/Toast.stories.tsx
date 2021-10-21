import { action } from '@storybook/addon-actions'
import { Toast } from './Toast'

export default {
  component: Toast,
}

export const Default = {
  args: {
    icon: 'checkO',
    variant: 'success',
    title: 'Success!',
    content: '7 members have been added.',
    onClose: action('onClose'),
  },
}
