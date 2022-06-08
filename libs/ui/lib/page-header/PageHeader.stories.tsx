import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { Folder24Icon } from '../icons'
import { PageHeader, PageTitle } from './PageHeader'

type Story = StoryObj<ComponentProps<typeof PageHeader>>

export default {
  component: PageHeader,
} as Story

export const Default: Story = {
  args: {
    children: <PageTitle icon={<Folder24Icon />}>This is a test</PageTitle>,
  },
}
