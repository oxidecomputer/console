import React from 'react'
import 'twin.macro'
import { EmptyState } from './EmptyState'

export default {
  component: EmptyState,
  title: 'Regions/EmptyState',
}

export const Default = () => {
  const props = {
    children: (
      <>
        <h3 tw="text-lg text-gray-50">This is some heading</h3>
        <p tw="text-base mt-4">
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
