import React from 'react'
import type { Story } from '@storybook/react'
import { Icon } from '../Icon'
import type { IconProps } from '../Icon'
import 'twin.macro'

const Template: Story<IconProps> = (args) => <Icon {...args} />

export const Default = Template.bind({})
Default.storyName = 'Icon'
Default.args = { name: 'bookmark', color: 'green500' }

export const CustomTitle = Template.bind({})
CustomTitle.storyName = 'Custom Title'
CustomTitle.args = { svgProps: { title: 'Cameron Howe' }, name: 'profile' }

// tw prop doesn't seem to work in MDX (sometimes it does?) so this has to be
// defined here
export const Rotate = () => <Icon name="chevron" tw="transform rotate-45" />
