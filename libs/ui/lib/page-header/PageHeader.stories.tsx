import { PageHeader, PageTitle } from './PageHeader'
import type { ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'
import React from 'react'
import { Folder24Icon } from '../icons'

type Story = StoryObj<ComponentProps<typeof PageHeader>>

export default {
  component: PageHeader,
} as Story

export const Default: Story = {
  args: {
    children: <PageTitle icon={<Folder24Icon />}>This is a test</PageTitle>,
  },
}
