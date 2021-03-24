import React from 'react'
import styled from 'styled-components'

import { Breadcrumbs } from '@oxide/ui'
import { Card } from '@oxide/ui'

const breadcrumbs = [
  { href: '/', label: 'Maze War' },
  { href: '/first', label: 'Projects' },
  { href: '/second', label: 'prod-online' },
  { href: '/third', label: 'Instances' },
  { label: 'DB1' },
]

const Wrapper = styled.div`
  ${({ theme }) => theme.spaceBetweenY(4)}
`

const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  ${({ theme }) => theme.spaceBetweenX(4)}
  margin: -${({ theme }) => theme.spacing(2)};

  > * {
    margin: ${({ theme }) => theme.spacing(2)};
  }
`

export default () => {
  return (
    <Wrapper>
      <Breadcrumbs data={breadcrumbs} />
      <div>
        <CardList>
          <Card title="Metrics" subtitle="Some status update" />
          <Card title="Activity" subtitle="Some status update" />
          <Card title="Access & IAM" subtitle="Some status update" />
        </CardList>
      </div>
    </Wrapper>
  )
}
