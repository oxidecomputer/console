import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Button, ButtonProps, sizes, variants } from './Button'

export default {
  component: Button,
  title: 'Components/Button',
  argTypes: {
    disabled: {
      table: {
        type: { summary: 'bool' },
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: {
        type: 'select',
        options: sizes,
      },
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'base' },
      },
    },
    variant: {
      control: {
        type: 'select',
        options: variants,
      },
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'solid' },
      },
    },
  },
} as Meta

const Template: Story<ButtonProps> = (args) => <Button {...args} />

export const Default = Template.bind({})
Default.args = {
  children: 'Button',
  disabled: false,
  size: 'base',
  variant: 'solid',
}

export const Outline = Template.bind({})
Outline.args = { ...Default.args, variant: 'outline' }

export const Ghost = Template.bind({})
Ghost.args = { ...Default.args, variant: 'ghost' }

export const Link = Template.bind({})
Link.args = { ...Default.args, variant: 'link' }

export const XSmall = Template.bind({})
XSmall.args = { ...Default.args, size: 'xs' }

export const Small = Template.bind({})
Small.args = { ...Default.args, size: 'sm' }

export const Large = Template.bind({})
Large.args = { ...Default.args, size: 'lg' }
