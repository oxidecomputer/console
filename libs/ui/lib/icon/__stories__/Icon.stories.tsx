import React from 'react'
import type { Story } from '@storybook/react'
import { Icon } from '../Icon'
import type { IconProps } from '../Icon'

const Template: Story<IconProps> = (args) => <Icon {...args} />

export const Default = Template.bind({})
Default.storyName = 'Icon'
Default.args = { name: 'bookmark' }

export const CustomTitle = Template.bind({})
CustomTitle.storyName = 'Custom Title'
CustomTitle.args = { svgProps: { title: 'Cameron Howe' }, name: 'profile' }
