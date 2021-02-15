import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Button, ButtonProps } from './Button'

export default {
  component: Button,
  title: 'Button',
} as Meta

const Template: Story<ButtonProps> = (args) => {
  return (
    <div>
      <Button {...args} />
    </div>
  )
}

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
