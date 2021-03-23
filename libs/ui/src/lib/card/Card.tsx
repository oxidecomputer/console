import type { FC } from 'react'
import React, { useMemo } from 'react'

import { v4 as uuid } from 'uuid'
import styled from 'styled-components'
import { Text } from '../text/Text'
import type { TextProps } from '../text/Text'
import { TextWithIcon } from '../text-with-icon/TextWithIcon'
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

const baseTextProps: Partial<TextProps> = {
  font: 'mono',
}

const Title = styled(Text).attrs({
  ...baseTextProps,
  as: 'div',
  color: 'green50',
  size: 'lg',
})`
  text-transform: uppercase;
`

const Subtitle = styled(Text).attrs({
  ...baseTextProps,
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

const DataHeader = styled(Text).attrs({
  ...baseTextProps,
  color: 'green700',
  size: 'xs',
  role: 'columnheader',
})`
  text-transform: uppercase;
`

const MainDataValue = styled(Text).attrs({
  ...baseTextProps,
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

const FooterText = styled(TextWithIcon).attrs({
  align: 'right',
  icon: {
    name: 'arrow',
    color: 'green50',
  },
  text: { ...baseTextProps, color: 'green50', size: 'sm' },
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
      </Footer>
    </StyledCard>
  )
}

export default Card
