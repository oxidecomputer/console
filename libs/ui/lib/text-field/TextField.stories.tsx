import { FormikDecorator } from '../../util/formik-decorator'
import { TextField } from './TextField'
import type { TextFieldProps } from './TextField'
import type { StoryObj } from '@storybook/react'

export default {
  component: TextField,
  decorators: [FormikDecorator('')],
} as StoryObj<TextFieldProps>

export const Default: StoryObj<TextFieldProps> = {}
