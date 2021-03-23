import React from 'react'
import type { Meta, Story } from '@storybook/react'
import type { Project } from '@oxide/backend-types'

import { ProjectList } from './ProjectList'
import type { ProjectListProps } from './ProjectList'

const demoProjects: Project[] = [
  { id: '1', name: 'prod-online', notificationsCount: 2, starred: true },
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
      defaultValue: [],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '300px' }}>
        <Story />
      </div>
    ),
  ],
} as Meta

const Template: Story<ProjectListProps> = (args) => <ProjectList {...args} />

export const Primary = Template.bind({})
Primary.args = { projects: demoProjects }

export const Empty = Template.bind({})
