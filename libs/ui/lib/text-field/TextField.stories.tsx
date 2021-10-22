import { FormikDecorator } from '../../util/formik-decorator'
import { TextField } from './TextField'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof TextField>>

export default {
  component: TextField,
  decorators: [FormikDecorator('')],
} as Story

export const Default: Story = {}
