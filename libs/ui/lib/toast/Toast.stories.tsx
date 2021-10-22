import { action } from '@storybook/addon-actions'
import { Toast } from './Toast'
import type { ToastProps } from './Toast'
import type { StoryObj } from '@storybook/react'

export default {
  component: Toast,
} as StoryObj<ToastProps>

export const Default: StoryObj<ToastProps> = {
  args: {
    icon: 'checkO',
    variant: 'success',
    title: 'Success!',
    content: '7 members have been added.',
    onClose: action('onClose'),
  },
}
