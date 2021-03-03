import React from 'react'

import { Meta } from '@storybook/react'

import { ProjectList, ProjectListProps } from './ProjectList'
import { Project } from '@oxide/backend-types'

const demoProjects: Project[] = [
  { id: '1', name: 'prod-online', notifications: 2, starred: true },
  { id: '2', name: 'release-infrastructure' },
  { id: '3', name: 'rendering' },
  { id: '4', name: 'test-infrastructure' },
  { id: '5', name: 'oxide-demo' },
]

export default {
  component: ProjectList,
  title: 'Layout/Sidebar Navigation/Project List',
  parameters: {
    actions: { argTypesRegex: '^on.*' },
  },
  argTypes: {
    projects: {
      description: 'The list of projects to show',
      defaultValue: demoProjects,
    },
  },
} as Meta

const Template = (props: ProjectListProps) => (
  <div style={{ maxWidth: '300px' }}>
    <ProjectList {...props} />
  </div>
)

export const Primary = Template.bind({})
