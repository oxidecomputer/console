import { action } from '@storybook/addon-actions'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { Success16Icon } from '../icons'
import { Toast } from './Toast'

type Story = StoryObj<ComponentProps<typeof Toast>>

export default {
  component: Toast,
} as Story

export const Default: Story = {
  args: {
    icon: <Success16Icon />,
    variant: 'success',
    title: 'Success!',
    content: '7 members have been added.',
    onClose: action('onClose'),
  },
}
