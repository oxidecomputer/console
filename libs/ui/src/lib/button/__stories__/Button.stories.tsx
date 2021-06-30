import type { PropsWithChildren } from 'react'
import React from 'react'
import type { Story } from '@storybook/react'

import { Button } from '../Button'
import type { ButtonProps } from '../Button'

type ButtonStory = Story<PropsWithChildren<ButtonProps>>

const Template: ButtonStory = (args) => <Button {...args} />

export const Default: ButtonStory = Template.bind({})
Default.args = {
  children: 'Button',
  disabled: false,
  size: 'base',
  variant: 'solid',
}
