import React from 'react'
import type { Story } from '@storybook/react'
import { TextWithIcon } from '../TextWithIcon'

export default {
  component: TextWithIcon,
  title: 'Foundations/TextWithIcon',
}

const Template: Story = (args) => (
  <TextWithIcon icon={{ name: 'plus' }} {...args} />
)

export const Default = Template.bind({})
Default.args = {
  align: 'right',
  children: `Create new project`,
  icon: { name: 'plus' },
}

export const TitleVariant = Template.bind({})
TitleVariant.args = {
  children: `Project Name`,
  icon: { name: 'project' },
  text: { variant: 'title' },
}
