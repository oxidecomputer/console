import React from 'react'
import type { Story } from '@storybook/react'
import type { AvatarProps } from '../Avatar'
import { Avatar } from '../Avatar'

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />

export const Person = Template.bind({})
const personArgs = { name: 'Cameron Howe', round: true }
Person.args = personArgs
