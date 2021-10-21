import { Button, buttonSizes, variants } from './Button'

export default {
  component: Button,
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: buttonSizes,
      },
    },
    variant: {
      control: {
        type: 'select',
        options: variants,
      },
    },
  },
}

export const Default = {
  args: {
    children: 'Button',
    disabled: false,
    size: 'base',
    variant: 'solid',
  },
}
