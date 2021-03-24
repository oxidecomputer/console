import React, { useMemo } from 'react'
import styled from 'styled-components'
import { colorPalette, colorGroups } from '@oxide/theme'
import type { Color, ColorGroup } from '@oxide/theme'
import Text from '../text/Text'

const ColorContainer = styled.div`
  display: flex;
  flex: 0 1 auto;
  align-items: stretch;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`
const ColorVisualizer = styled.div<{ value: string }>`
  background-color: ${({ value }) => value};
  width: ${({ theme }) => theme.spacing(12)};
  height: ${({ theme }) => theme.spacing(12)};
  margin-right: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.color('gray800')};
`
const ColorInfo = styled(Text).attrs({ as: 'code', font: 'mono' })`
display: flex;
:first-of-type {
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }
`

const ColorComponent: React.FC<{ name: Color; value: string }> = ({
  name,
  value,
}) => (
  <ColorContainer>
    <ColorVisualizer value={value} />
    <div style={{
      display: 'flex',
      flexDirection: 'column'
      }}>
      <ColorInfo>{name}</ColorInfo>
      <ColorInfo>{value}</ColorInfo>
    </div>
  </ColorContainer>
)

const ColorGroupContainer = styled.div<{ isSingleColor?: boolean }>`
  flex: ${({ isSingleColor }) => (isSingleColor ? '1 1 100%' : 'auto')};
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  margin-right: ${({ isSingleColor }) => (isSingleColor ? '0' : '1em')};
`
const ColorGroupTitle = styled(Text).attrs({ as: 'h3', font: 'sans' })`
  text-transform: capitalize;
  margin: ${({ theme }) => theme.spacing(4)} 0;
`

const ColorGroupComponent: React.FC<{ group: ColorGroup }> = ({ group }) => {
  const colors = useMemo(
    () =>
      (Object.keys(colorPalette) as Color[])
        .filter((color) => color.startsWith(group))
        .map((k) => ({
          name: k,
          value: colorPalette[k],
        })),
    [group]
  )
  return (
    <ColorGroupContainer isSingleColor={colors.length === 1}>
      <ColorGroupTitle>{group}</ColorGroupTitle>
      {colors.map(({ name, value }) => (
        <ColorComponent key={name} name={name} value={value} />
      ))}
    </ColorGroupContainer>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
`

export const AllColors: React.FC = () => {
  return (
    <Container>
      {colorGroups.map((group) => (
        <ColorGroupComponent key={group} group={group} />
      ))}
    </Container>
  )
}
