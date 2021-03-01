import React from 'react'
import { ProjectList, ProjectListProps } from './ProjectList'

export default {
  component: ProjectList,
  title: 'Layout/Sidebar Navigation/Project List',
  parameters: {
    backgrounds: { default: 'gray900' },
  },
}

export const primary = () => {
  const props: ProjectListProps = {
    projects: [
      { id: '1', name: 'prod-online', notifications: 2, starred: true },
      { id: '2', name: 'release-infrastructure' },
      { id: '3', name: 'rendering' },
      { id: '4', name: 'test-infrastructure' },
      { id: '5', name: 'oxide-demo' },
    ],
    selectedProjectId: '2',
  }

  return (
    <div style={{ maxWidth: '300px' }}>
      <ProjectList {...props} />
    </div>
  )
}
