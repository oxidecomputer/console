import React from 'react'
import type { Story } from '@storybook/react'
import { Icon, IconProps } from '../Icon'

const Template: Story<IconProps> = (args) => <Icon {...args} />

export const Default = Template.bind({})
Default.storyName = 'Icon'
Default.args = { name: 'bookmark', color: 'green500' }

export const Rotate = Template.bind({})
Rotate.args = { name: 'chevron', rotate: '45deg' }
