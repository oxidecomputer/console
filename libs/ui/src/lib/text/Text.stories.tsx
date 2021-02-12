import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Text, TextProps } from './Text'

export default {
  component: Text,
  title: 'Text',
} as Meta

// Create a placeholder component of how args map to rendering
const Template: Story<TextProps> = (args) => <Text {...args} />

export const Default = Template.bind({})
Default.args = {
  children: `Text will render as a 'span' by default.`,
  font: 'sans',
}

export const RenderAsAParagraphTag = (args) => (
  <Text as="p" {...args}>
    Text can be rendered as another element, but please be sure to use the
    correct semantic element to maintain an{' '}
    <a href="https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html">
      accessible Document Outline
    </a>{' '}
    and rely on styles for changing the appearance. This message brought to you
    by the <a href="https://www.w3.org/WAI/standards-guidelines/wcag/">WCAG</a>.
    Thank you.
  </Text>
)

export const XSmall = Template.bind({})
XSmall.args = { ...Default.args, size: 'xs' }

export const Small = Template.bind({})
Small.args = { ...Default.args, size: 'sm' }

export const Base = Template.bind({})
Base.args = { ...Default.args, size: 'base' }

export const Large = Template.bind({})
Large.args = { ...Default.args, size: 'lg' }

export const XLarge = Template.bind({})
XLarge.args = { ...Default.args, size: 'xl' }

export const XXLarge = Template.bind({})
XXLarge.args = { ...Default.args, size: '2xl' }

export const XXXLarge = Template.bind({})
XXXLarge.args = { ...Default.args, size: '3xl' }

export const XXXXLarge = Template.bind({})
XXXXLarge.args = { ...Default.args, size: '4xl' }

export const XXXXXLarge = Template.bind({})
XXXXXLarge.args = { ...Default.args, size: '5xl' }

export const XXXXXXLarge = Template.bind({})
XXXXXXLarge.args = { ...Default.args, size: '6xl' }

export const XXXXXXXLarge = Template.bind({})
XXXXXXXLarge.args = { ...Default.args, size: '7xl' }

export const XXXXXXXXLarge = Template.bind({})
XXXXXXXXLarge.args = { ...Default.args, size: '8xl' }

export const XXXXXXXXXLarge = Template.bind({})
XXXXXXXXXLarge.args = { ...Default.args, size: '9xl' }
