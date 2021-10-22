import { Icon } from './Icon'
import type { IconProps } from './Icon'
import type { StoryObj } from '@storybook/react'

export default { component: Icon } as StoryObj<IconProps>

export const Default: StoryObj<IconProps> = {
  args: { name: 'bookmark' },
}

export const CustomTitle: StoryObj<IconProps> = {
  args: { svgProps: { title: 'Cameron Howe' }, name: 'profile' },
}
