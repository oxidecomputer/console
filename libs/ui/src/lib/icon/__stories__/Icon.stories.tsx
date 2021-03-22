import React from 'react'
import type { Story } from '@storybook/react'
import type { IconProps } from '../Icon'
import { Icon } from '../Icon'

const Template: Story<IconProps> = (args) => <Icon {...args} />

export const Default = Template.bind({})
Default.storyName = 'Icon'
Default.args = { name: 'bookmark', color: 'green500', size: '3xl' }

export const Rotate = Template.bind({})
Rotate.args = { name: 'chevron', rotate: '45deg' }

export const CustomTitle = Template.bind({})
CustomTitle.storyName = 'Custom Title'
CustomTitle.args = { svgProps: { title: 'Cameron Howe' }, name: 'profile' }
