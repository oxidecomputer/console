import React from 'react'
import styled from 'styled-components'

import { Breadcrumbs, Icon, PageHeader, TextWithIcon } from '@oxide/ui'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})`
  ${Icon} {
    font-size: ${({ theme }) => theme.spacing(8)};
    margin-right: ${({ theme }) => theme.spacing(3)};
  }
`

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
      <PageHeader>
        <Title>Create Instance</Title>
      </PageHeader>
      <p style={{ marginTop: '2rem' }}>There is nothing here, sorry</p>
    </>
  )
}

export default InstancesPage
