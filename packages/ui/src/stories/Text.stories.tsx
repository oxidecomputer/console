// Button.stories.tsx

import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Text, TextProps } from '../Text'

export const Default = () => (
  <Text>Text will render as a 'span' by default.</Text>
)

export const RenderAsAParagraphTag = () => (
  <Text as="p">
    Text can be rendered as another element, but please be sure to use the
    correct semantic element to maintain an <a href="https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html">accessible Document Outline</a> and rely on styles for changing the appearance.
    This message brought to you by the <a href="https://www.w3.org/WAI/standards-guidelines/wcag/">WCAG</a>. Thank you.
  </Text>
)

// Create a placeholder component of how args map to rendering
const Template: Story<TextProps> = (args) => <Text {...args}>Example text</Text>

export const XSmall = Template.bind({})
XSmall.args = { size: 'xs' }

export const Small = Template.bind({})
Small.args = { size: 'sm' }

export const Base = Template.bind({})
Base.args = { size: 'base' }

export const Large = Template.bind({})
Large.args = { size: 'lg' }

export const XLarge = Template.bind({})
XLarge.args = { size: 'xl' }

export const XXLarge = Template.bind({})
XXLarge.args = { size: '2xl' }

export const XXXLarge = Template.bind({})
XXXLarge.args = { size: '3xl' }

export const XXXXLarge = Template.bind({})
XXXXLarge.args = { size: '4xl' }

export const XXXXXLarge = Template.bind({})
XXXXXLarge.args = { size: '5xl' }

export const XXXXXXLarge = Template.bind({})
XXXXXXLarge.args = { size: '6xl' }

export const XXXXXXXLarge = Template.bind({})
XXXXXXXLarge.args = { size: '7xl' }

export const XXXXXXXXLarge = Template.bind({})
XXXXXXXXLarge.args = { size: '8xl' }

export const XXXXXXXXXLarge = Template.bind({})
XXXXXXXXXLarge.args = { size: '9xl' }


export default {
  title: 'Styles/Text',
  component: Text,
} as Meta
