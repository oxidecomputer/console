import React from 'react'
import styled from 'styled-components'

import { useParams } from 'react-router-dom'

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

type Params = {
  projectId?: string
}

const InstancesPage = () => {
  const { projectId } = useParams<Params>()
  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <Header>
        <Title>Instances for Project: {projectId}</Title>
      </Header>
      <p style={{ marginTop: '2rem' }}>There is nothing here, sorry</p>
    </>
  )
}

export default InstancesPage
