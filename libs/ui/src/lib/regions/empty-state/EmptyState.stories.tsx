import React from 'react'
import { EmptyState } from './EmptyState'
import { Text } from '../../text/Text'

export default {
  component: EmptyState,
  title: 'Regions/EmptyState',
}

export const Default = () => {
  const props = {
    children: (
      <>
        <Text as="h3" size="lg" color="gray50">
          This is some heading
        </Text>
        <Text size="base">
          A project contains a set of compute resources. You can think of it
          like a “folder” or “directory” for computer resources. You can allow
          certain users and teams to access a project or indivdual resources
          within it.
        </Text>
      </>
    ),
  }

  return <EmptyState>{props.children}</EmptyState>
}
