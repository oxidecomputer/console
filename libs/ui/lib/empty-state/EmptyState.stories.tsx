import React from 'react'
import { EmptyState } from './EmptyState'
import type { EmptyStateProps } from './EmptyState'
import type { StoryObj } from '@storybook/react'

export default {
  component: EmptyState,
} as StoryObj<EmptyStateProps>

export const Default = () => {
  const props = {
    children: (
      <>
        <h3 className="text-lg text-white">This is some heading</h3>
        <p className="text-base mt-4">
          A project contains a set of compute resources. You can think of it
          like a “folder” or “directory” for computer resources. You can allow
          certain users and teams to access a project or indivdual resources
          within it.
        </p>
      </>
    ),
  }

  return <EmptyState>{props.children}</EmptyState>
}
