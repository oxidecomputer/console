import { Breadcrumbs } from './Breadcrumbs'
import type { BreadcrumbsProps } from './Breadcrumbs'
import type { StoryObj } from '@storybook/react'

// Follow https://github.com/storybookjs/storybook/issues/12078
// for allowing better controls for objects
export default {
  component: Breadcrumbs,
  argTypes: {
    data: {
      control: { type: 'object' },
    },
  },
} as StoryObj<BreadcrumbsProps>

export const Default: StoryObj<BreadcrumbsProps> = {
  args: {
    data: [
      { href: '/', label: 'Home' },
      { href: '/first', label: 'First page' },
      { href: '/second', label: 'Second page' },
      { label: 'Third page' },
    ],
  },
}
