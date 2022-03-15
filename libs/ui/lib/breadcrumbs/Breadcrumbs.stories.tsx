import type { Breadcrumbs } from './Breadcrumbs'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

type Story = StoryObj<ComponentProps<typeof Breadcrumbs>>

// Follow https://github.com/storybookjs/storybook/issues/12078
// for allowing better controls for objects
// export default {
//   component: Breadcrumbs,
//   argTypes: {
//     data: {
//       control: { type: 'object' },
//     },
//   },
// } as Story

export const Default: Story = {
  args: {
    data: [
      { href: '/', label: 'Home' },
      { href: '/first', label: 'First page' },
      { href: '/second', label: 'Second page' },
      { label: 'Third page' },
    ],
  },
}
