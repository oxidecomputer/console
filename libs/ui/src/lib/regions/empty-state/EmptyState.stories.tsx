import React from 'react'
import { styled } from 'twin.macro'
import { EmptyState } from './EmptyState'
import { Text } from '../../text/Text'
import { spacing } from '@oxide/css-helpers'

export default {
  component: EmptyState,
  title: 'Regions/EmptyState',
}

const Title = styled(Text).attrs({
  as: 'h3',
  size: 'lg',
  color: 'gray50',
})``

const Description = styled(Text).attrs({
  as: 'p',
  size: 'base',
})`
  margin-top: ${spacing(4)};
`

export const Default = () => {
  const props = {
    children: (
      <>
        <Title>This is some heading</Title>
        <Description>
          A project contains a set of compute resources. You can think of it
          like a “folder” or “directory” for computer resources. You can allow
          certain users and teams to access a project or indivdual resources
          within it.
        </Description>
      </>
    ),
  }

  return <EmptyState>{props.children}</EmptyState>
}
