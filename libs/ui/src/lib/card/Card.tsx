import type { FC } from 'react'
import React, { useMemo } from 'react'

import { v4 as uuid } from 'uuid'
import styled from 'styled-components'
import { Text } from '../text/Text'
import { Icon } from '../icon/Icon'
import { default as Sparkline } from './sparkline.svg'

export interface CardProps {
  title: string
  subtitle: string
}

const StyledCard = styled.article``

const Main = styled.main`
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.color('green800', 0.33)};
`

const BaseText = styled(Text).attrs({ font: 'mono' })``

const Title = styled(BaseText).attrs({
  as: 'div',
  color: 'green50',
  size: 'lg',
})`
  text-transform: uppercase;
`

const Subtitle = styled(BaseText).attrs({
  as: 'div',
  color: 'green50',
  size: 'sm',
})``

const Data = styled.div`
  display: flex;
  flex-direction: row;

  margin-top: ${({ theme }) => theme.spacing(6)};
  margin-bottom: ${({ theme }) => theme.spacing(16)};
`

const DataTable = styled.div`
  flex: 0 0 auto;

  display: grid;
  grid-template: 1fr 1fr / 1fr 1fr;
  column-gap: ${({ theme }) => theme.spacing(6)};
`

const DataHeader = styled(BaseText).attrs({
  color: 'green700',
  size: 'xs',
  role: 'columnheader',
})`
  text-transform: uppercase;
`

const MainDataValue = styled(BaseText).attrs({
  color: 'gray50',
  size: 'xl',
  role: 'cell',
})`
  align-self: baseline;
`

const SecondaryDataValue = styled(MainDataValue).attrs({
  size: 'sm',
})``

const Chart = styled.section`
  flex: 1;
  align-self: flex-end;
`

const Footer = styled.footer`
  background: ${({ theme }) => theme.color('green900', 0.33)};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: row;

  justify-content: baseline;
`

const FooterText = styled(BaseText).attrs({
  color: 'green50',
  size: 'sm',
})`
  text-transform: uppercase;
  margin-right: ${({ theme }) => theme.spacing(2)};
`

export const Card: FC<CardProps> = (props) => {
  const tableId = useMemo(() => uuid(), [])

  return (
    <StyledCard>
      <Main>
        <Title>{props.title}</Title>
        <Subtitle>{props.subtitle}</Subtitle>
        <Data>
          <DataTable
            role="table"
            aria-label={props.title}
            aria-describedby={tableId}
          >
            <DataHeader id={tableId}>Heading</DataHeader>
            <DataHeader>Data</DataHeader>
            <MainDataValue>3</MainDataValue>
            <SecondaryDataValue>3%</SecondaryDataValue>
          </DataTable>
          <Chart>
            <Sparkline />
          </Chart>
        </Data>
      </Main>
      <Footer>
        <FooterText>View Pagename </FooterText>
        <Icon name="arrow" size="sm" color="green50" />
      </Footer>
    </StyledCard>
  )
}

export default Card
