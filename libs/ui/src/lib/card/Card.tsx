import type { FC } from 'react'
import React, { useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import styled from 'styled-components'

import { styleUtils as su } from '@oxide/theme'
import { TextWithIcon } from '../text-with-icon/TextWithIcon'
import Sparkline from './sparkline.svg'

export interface CardProps {
  title: string
  subtitle: string
}

const StyledCard = styled.article`
  color: ${su.color('green50')};
`

const Main = styled.main`
  padding: ${su.spacing(4)};
  background-color: ${su.color('green800', 0.24)};
`

const Title = styled.div`
  text-transform: uppercase;
  ${su.textSize('lg')}
`

const Subtitle = styled.div`
  ${su.textSize('sm')}
`

const Data = styled.div`
  display: flex;

  margin-top: ${su.spacing(6)};
  margin-bottom: ${su.spacing(16)};
`

const DataTable = styled.div`
  flex: 0 0 auto;

  display: grid;
  grid-template: 1fr 1fr / 1fr 1fr;
  column-gap: ${su.spacing(6)};
`

const DataHeader = styled.span.attrs({ role: 'columnheader' })`
  text-transform: uppercase;
  ${su.textSize('sm')}
  color: ${su.color('green500')}
`

const MainDataValue = styled.span.attrs({ role: 'cell' })`
  align-self: baseline;
  ${su.textSize('xl')}
`

const SecondaryDataValue = styled(MainDataValue)`
  ${su.textSize('sm')}
`

const Chart = styled.section`
  flex: 1;
  align-self: flex-end;
`

const Footer = styled.footer`
  background: ${su.color('green800', 0.16)};
  padding: ${su.spacing(4)};
  display: flex;
  justify-content: baseline;
`

const FooterText = styled(TextWithIcon).attrs({
  align: 'right',
  icon: { name: 'arrow' },
})`
  text-transform: uppercase;
  margin-right: ${su.spacing(2)};
  ${su.textSize('sm')}
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
        <FooterText>View Pagename </FooterText>
      </Footer>
    </StyledCard>
  )
}
