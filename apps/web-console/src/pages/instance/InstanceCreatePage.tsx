import React from 'react'
import styled from 'styled-components'

import { Icon, PageHeader, TextWithIcon } from '@oxide/ui'
import { LiveBreadcrumbs } from '../../components/LiveBreadcrumbs'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})`
  ${Icon} {
    font-size: ${({ theme }) => theme.spacing(8)};
    margin-right: ${({ theme }) => theme.spacing(3)};
  }
`

const InstancesPage = () => {
  return (
    <>
      <LiveBreadcrumbs />
      <PageHeader>
        <Title>Create Instance</Title>
      </PageHeader>
      <p style={{ marginTop: '2rem' }}>There is nothing here, sorry</p>
    </>
  )
}

export default InstancesPage
