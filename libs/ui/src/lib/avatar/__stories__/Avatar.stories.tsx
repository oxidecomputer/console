import React from 'react'
import type { Story } from '@storybook/react'
import type { AvatarProps } from '../Avatar'
import { Avatar } from '../Avatar'

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />

export const Person = Template.bind({})
const personArgs = { name: 'Cameron Howe', isPerson: true }
Person.args = personArgs

const orgArgs = { name: 'Colossal Cave Adventure' }

const AvatarAlignmentTemplate: Story<AvatarProps> = (args) => (
  <div>
    <Avatar {...args} />
    <Avatar {...personArgs} src="http://placekitten.com/32/32" />
    <Avatar {...orgArgs} />
    <Avatar {...orgArgs} src="http://placekitten.com/100/100" />
  </div>
)

export const AvatarAlignment = AvatarAlignmentTemplate.bind({})
AvatarAlignment.args = { ...Person.args }
