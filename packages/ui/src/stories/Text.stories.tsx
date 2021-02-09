// Button.stories.tsx

import React from 'react'
import { Story, Meta } from '@storybook/react'
import { Text, TextProps } from '../Text'

// Create a placeholder component of how args map to rendering
const Template: Story<TextProps> = (args) => <Text {...args} />

export const Default = Template.bind({})
Default.args = {
  children: `Text will render as a 'span' by default.`,
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
XSmall.args = { size: 'xs', children: `Example text` }

export const Small = Template.bind({})
Small.args = { size: 'sm', children: `Example text` }

export const Base = Template.bind({})
Base.args = { size: 'base', children: `Example text` }

export const Large = Template.bind({})
Large.args = { size: 'lg', children: `Example text` }

export const XLarge = Template.bind({})
XLarge.args = { size: 'xl', children: `Example text` }

export const XXLarge = Template.bind({})
XXLarge.args = { size: '2xl', children: `Example text` }

export const XXXLarge = Template.bind({})
XXXLarge.args = { size: '3xl', children: `Example text` }

export const XXXXLarge = Template.bind({})
XXXXLarge.args = { size: '4xl', children: `Example text` }

export const XXXXXLarge = Template.bind({})
XXXXXLarge.args = { size: '5xl', children: `Example text` }

export const XXXXXXLarge = Template.bind({})
XXXXXXLarge.args = { size: '6xl', children: `Example text` }

export const XXXXXXXLarge = Template.bind({})
XXXXXXXLarge.args = { size: '7xl', children: `Example text` }

export const XXXXXXXXLarge = Template.bind({})
XXXXXXXXLarge.args = { size: '8xl', children: `Example text` }

export const XXXXXXXXXLarge = Template.bind({})
XXXXXXXXXLarge.args = { size: '9xl', children: `Example text` }

export default {
  title: 'Styles/Text',
  component: Text,
  argTypes: {
    children: { control: 'text' },
  },
} as Meta
