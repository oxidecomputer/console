import React from 'react'
import styled from 'styled-components'

import {
  Breadcrumbs,
  Button,
  Card,
  Icon,
  Tabs,
  Text,
  TextWithIcon,
} from '@oxide/ui'

import { InstancePageTables } from './InstancePageTables'

const breadcrumbs = [
  { href: '/', label: 'Maze War' },
  { href: '/first', label: 'Projects' },
  { href: '/second', label: 'prod-online' },
  { href: '/third', label: 'Instances' },
  { label: 'DB1' },
]

const Wrapper = styled.div``

const Header = styled.header`
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

const PageActions = styled.div``

const StyledButton = styled(Button).attrs({
  variant: 'ghost',
})``

const Edit = styled(TextWithIcon).attrs({
  icon: { name: 'pen' },
})``

const Reset = styled(TextWithIcon).attrs({
  icon: { name: 'stopwatch' },
})``

const Stop = styled(TextWithIcon).attrs({
  icon: { name: 'playStopO' },
})``

const Suspend = styled(TextWithIcon).attrs({
  icon: { name: 'playPauseO' },
})``

const Delete = styled(TextWithIcon).attrs({
  icon: { name: 'trash' },
})``

const Metadata = styled(Text).attrs({
  color: 'gray300',
})`
  display: block;
  margin-top: ${({ theme }) => theme.spacing(3)};
  text-transform: uppercase;
`

const StyledTabs = styled(Tabs)`
  margin-top: ${({ theme }) => theme.spacing(4)};
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
      <Header>
        <Title>Instances</Title>
        <PageActions>
          <StyledButton>
            <Edit>Edit</Edit>
          </StyledButton>
          <StyledButton>
            <Reset>Reset</Reset>
          </StyledButton>
          <StyledButton>
            <Stop>Stop</Stop>
          </StyledButton>
          <StyledButton>
            <Suspend>Suspend</Suspend>
          </StyledButton>
          <StyledButton>
            <Delete>Delete</Delete>
          </StyledButton>
          <Button variant="outline">SSH</Button>
          <Button variant="outline">
            <Icon name="more" />
          </Button>
        </PageActions>
      </Header>
      <Metadata>TODO: Metadata</Metadata>
      <StyledTabs
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
      </StyledTabs>
    </Wrapper>
  )
}
