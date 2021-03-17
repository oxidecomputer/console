import React from 'react'
import type { Story } from '@storybook/react'
import { Icon, IconProps } from '../Icon'

const Template: Story<IconProps> = (args) => <Icon {...args} />

export const Default = Template.bind({})
Default.storyName = 'Icon'
Default.args = { name: 'bookmark', color: 'green500' }

export const CustomTitle = Template.bind({})
CustomTitle.storyName = 'Custom Title'
CustomTitle.args = { svgProps: { title: 'Cameron Howe' }, name: 'profile' }
