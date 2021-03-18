import React from 'react'
import { Story } from '@storybook/react'
import { Text } from '../Text'

const Template: Story = (args) => <Text {...args} />

export const Default = Template.bind({})
Default.args = {
  children: `Text will render as a 'span' by default.`,
}

export const AsPTag = Template.bind({})
AsPTag.storyName = 'Render as `p` tag'
AsPTag.args = {
  as: 'p',
  children: `Text can be rendered in a <p> tag using the 'as' prop.`,
}

export const XXS = Template.bind({})
XXS.args = { size: 'xxs', children: `'xxs' size text` }

export const XS = Template.bind({})
XS.args = { size: 'xs', children: `'xs' size text` }

export const SM = Template.bind({})
SM.args = { size: 'sm', children: `'sm' size text` }

export const Base = Template.bind({})
Base.args = { size: 'base', children: `'base' size text` }

export const LG = Template.bind({})
LG.args = { size: 'lg', children: `'lg' size text` }

export const XL = Template.bind({})
XL.args = { size: 'xl', children: `'xl' size text` }

export const TwoXL = Template.bind({})
TwoXL.args = { size: '2xl', children: `'2xl' size text` }
TwoXL.storyName = '2xl'

export const ThreeXL = Template.bind({})
ThreeXL.args = { size: '3xl', children: `'3xl' size text` }
ThreeXL.storyName = '3xl'

export const FourXL = Template.bind({})
FourXL.args = { size: '4xl', children: `'4xl' size text` }
FourXL.storyName = '4xl'

export const FiveXL = Template.bind({})
FiveXL.args = { size: '5xl', children: `'5xl' size text` }
FiveXL.storyName = '5xl'

export const SixXL = Template.bind({})
SixXL.args = { size: '6xl', children: `'6xl' size text` }
SixXL.storyName = '6xl'

export const SevenXL = Template.bind({})
SevenXL.args = { size: '7xl', children: `'7xl' size text` }
SevenXL.storyName = '7xl'

export const EightXL = Template.bind({})
EightXL.args = { size: '8xl', children: `'8xl' size text` }
EightXL.storyName = '8xl'

export const NineXL = Template.bind({})
NineXL.args = { size: '9xl', children: `'9xl' size text` }
NineXL.storyName = '9xl'

export const WithIcon = Template.bind({})
WithIcon.args = { icon: { name: 'plus' }, children: 'Text with icon' }

export const TitleWithIcon = Template.bind({})
TitleWithIcon.args = {
  icon: { name: 'plus' },
  variant: 'title',
  children: 'Text with icon',
}

export const TitleVariant = Template.bind({})
TitleVariant.args = {
  variant: 'title',
  children: 'Title Text Variant',
}
