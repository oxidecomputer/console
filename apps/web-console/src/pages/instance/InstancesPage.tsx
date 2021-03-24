import React from 'react'
import styled from 'styled-components'

import type { RouteComponentProps } from '@reach/router'

import { Breadcrumbs, TextWithIcon } from '@oxide/ui'

const Header = styled.header`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-top: ${({ theme }) => theme.spacing(2)};
`

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: {
    name: 'instance',
  },
})``

const breadcrumbs = [
  { href: '/', label: 'Maze War' },
  { href: '/first', label: 'Projects' },
  { href: '/second', label: 'prod-online' },
  { label: 'Instances' },
]

interface Props extends RouteComponentProps {
  projectId?: string
}

const InstancesPage = (props: Props) => {
  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <Header>
        <Title>Instances for Project: {props.projectId}</Title>
      </Header>
      <p style={{ marginTop: '2rem' }}>There is nothing here, sorry</p>
    </>
  )
}

export default InstancesPage
