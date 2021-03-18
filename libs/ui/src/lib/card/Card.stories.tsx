import React from 'react'
import type { Story } from '@storybook/react'
import { Card, CardProps } from './Card'

export default {
  component: Card,
  title: 'Components/Card',
}

const Template: Story<CardProps> = (args) => <Card {...args} />

export const Primary: Story<CardProps> = Template.bind({})
Primary.args = { title: 'Metrics', subtitle: 'Some status update' }
