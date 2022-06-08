import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { FormikDecorator } from '../../util/formik-decorator'
import { TextField } from './TextField'

type Story = StoryObj<ComponentProps<typeof TextField>>

export default {
  component: TextField,
  decorators: [FormikDecorator('')],
} as Story

export const Default: Story = {
  args: {
    placeholder: 'Placeholder',
  },
}

export const WithValue: Story = {
  args: {
    value: 'Something here',
  },
}
