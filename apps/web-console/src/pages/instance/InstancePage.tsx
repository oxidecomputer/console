import React from 'react'
import styled from 'styled-components'

import { Breadcrumbs } from '@oxide/ui'
import { Card } from '@oxide/ui'

import { Tabs } from '@oxide/ui'
import { InstancePageTables } from './InstancePageTables'

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
const OverviewPanel = styled.div``

export default () => {
  return (
    <Wrapper>
      <Breadcrumbs data={breadcrumbs} />
      <Tabs
        label="Instance Page"
        tabs={['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings']}
      >
        <OverviewPanel>
          <div>
            <CardList>
              <Card title="Metrics" subtitle="Some status update" />
              <Card title="Activity" subtitle="Some status update" />
              <Card title="Access & IAM" subtitle="Some status update" />
            </CardList>
          </div>
          <InstancePageTables />
        </OverviewPanel>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </Tabs>
    </Wrapper>
  )
}
