import type { Meta } from '@storybook/react'
import { Breadcrumbs } from './Breadcrumbs'

// Follow https://github.com/storybookjs/storybook/issues/12078
// for allowing better controls for objects
export default {
  component: Breadcrumbs,
  argTypes: {
    data: {
      control: { type: 'object' },
    },
  },
} as Meta

export const Default = {
  args: {
    data: [
      { href: '/', label: 'Home' },
      { href: '/first', label: 'First page' },
      { href: '/second', label: 'Second page' },
      { label: 'Third page' },
    ],
  },
}
