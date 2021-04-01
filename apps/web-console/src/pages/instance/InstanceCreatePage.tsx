import React from 'react'
import styled from 'styled-components'

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
    name: 'instances',
  },
})``

const breadcrumbs = [
  { href: '/', label: 'Maze War' },
  { href: '/projects', label: 'Projects' },
  { href: '/projects/prod-online', label: 'prod-online' },
  { href: '/projects/prod-online/instances', label: 'Instances' },
  { label: 'Create Instance' },
]

const InstancesPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <Header>
        <Title>Create Instance</Title>
      </Header>
      <p style={{ marginTop: '2rem' }}>There is nothing here, sorry</p>
    </>
  )
}

export default InstancesPage
