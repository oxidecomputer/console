import { action } from '@storybook/addon-actions'
import { Toast } from './Toast'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import { CheckmarkRoundelSmallIcon } from '../icons'

type Story = StoryObj<ComponentProps<typeof Toast>>

export default {
  component: Toast,
} as Story

export const Default: Story = {
  args: {
    icon: <CheckmarkRoundelSmallIcon title="Success" />,
    variant: 'success',
    title: 'Success!',
    content: '7 members have been added.',
    onClose: action('onClose'),
  },
}
