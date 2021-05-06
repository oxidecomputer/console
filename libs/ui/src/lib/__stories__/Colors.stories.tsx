import React from 'react'
import tw, { styled } from 'twin.macro'
import type { Color } from '@oxide/css-helpers'
import { colorPalette, colorGroups, colorNames } from '@oxide/css-helpers'
import Text from '../text/Text'
import { color, spacing } from '@oxide/css-helpers'

interface ColorProps {
  name: Color
  value: string
}

const ColorContainer = styled.div`
  display: flex;
  flex: 0 1 auto;
  align-items: stretch;
  margin-bottom: ${spacing(4)};
`
const ColorVisualizer = styled.div<Pick<ColorProps, 'value'>>`
  background-color: ${({ value }) => value};
  width: ${spacing(12)};
  height: ${spacing(12)};
  margin-right: ${spacing(3)};
  border: 1px solid ${color('gray800')};
`
const ColorInfo = styled(Text).attrs({ as: 'code' })`
  display: flex;
  :first-of-type {
    margin-bottom: ${spacing(3)};
  }
`

const ColorComponent: React.FC<ColorProps> = ({ name, value }) => (
  <ColorContainer>
    <ColorVisualizer value={value} />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ColorInfo>{name}</ColorInfo>
      <ColorInfo>{value}</ColorInfo>
    </div>
  </ColorContainer>
)

const ColorGroupContainer = styled.div<{ isSingleColor?: boolean }>`
  flex: ${({ isSingleColor }) => (isSingleColor ? '1 1 100%' : '0 0 25%')};
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`

const ColorGroupTitle = tw.h3`capitalize my-4 font-sans`

const ColorGroupComponent: React.FC<{
  group: string
  colors: ColorProps[]
}> = ({ group, colors }) => (
  <ColorGroupContainer isSingleColor={colors.length === 1}>
    <ColorGroupTitle>{group}</ColorGroupTitle>
    {colors.map(({ name, value }) => (
      <ColorComponent key={name} name={name} value={value} />
    ))}
  </ColorGroupContainer>
)

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
`

const findColors = (v: string): ColorProps[] =>
  colorNames
    .filter((color) => color.startsWith(v))
    .map((k) => ({
      name: k,
      value: colorPalette[k],
    }))

const mapColors = (group: string): [string, ColorProps[]] => [
  group,
  findColors(group),
]

const groups: [string, ColorProps[]][] = [
  mapColors('white'),
  mapColors('black'),
  ...colorGroups.map(mapColors),
  mapColors('darkBg'),
]

export const AllColors: React.FC = () => (
  <Container>
    {groups.map(([group, colors]) => (
      <ColorGroupComponent key={group} group={group} colors={colors} />
    ))}
  </Container>
)
