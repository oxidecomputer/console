import type { FC } from 'react'
import React, { useMemo } from 'react'

import { v4 as uuid } from 'uuid'
import styled from 'styled-components'
import { Text } from '../text/Text'
import Sparkline from './sparkline.svg'

export interface CardProps {
  title: string
  subtitle: string
}

const StyledCard = styled.article``

const Main = styled.main`
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.color('green800', 0.24)};
`

const Title = styled(Text).attrs({
  as: 'div',
  color: 'green500',
  size: 'lg',
})`
  text-transform: uppercase;
`

const Subtitle = styled(Text).attrs({
  as: 'div',
  color: 'green500',
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

const DataHeader = styled(Text).attrs({
  color: 'green500',
  size: 'sm',
  role: 'columnheader',
})`
  text-transform: uppercase;
`

const MainDataValue = styled(Text).attrs({
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
  background: ${({ theme }) => theme.color('green800', 0.16)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: row;
  justify-content: baseline;
`

const FooterText = styled(Text).attrs({
  as: 'div',
  color: 'green500',
  size: 'xs',
})`
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
            <Sparkline
              style={{
                stroke: '#48D597',
                strokeOpacity: 0.8,
              }}
            />
          </Chart>
        </Data>
      </Main>
      <Footer>
        <FooterText>Optional link</FooterText>
      </Footer>
    </StyledCard>
  )
}
