import React from 'react'
import { action } from '@storybook/addon-actions'
import type { Toast } from './Toast'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import { Success16Icon } from '../icons'

type Story = StoryObj<ComponentProps<typeof Toast>>

export const Default: Story = {
  args: {
    icon: <Success16Icon />,
    variant: 'success',
    title: 'Success!',
    content: '7 members have been added.',
    onClose: action('onClose'),
  },
}
