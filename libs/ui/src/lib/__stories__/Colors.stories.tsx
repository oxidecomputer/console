import React from 'react'
import 'twin.macro'
import type { Color } from '@oxide/css-helpers'
import { colorPalette, colorGroups, colorNames } from '@oxide/css-helpers'

interface ColorProps {
  name: Color
  value: string
}

const colorGroup = (group: string): [string, ColorProps[]] => [
  group,
  colorNames
    .filter((color) => color.startsWith(group))
    .map((k) => ({ name: k, value: colorPalette[k] })),
]

const groups: [string, ColorProps[]][] = [
  colorGroup('white'),
  colorGroup('black'),
  ...colorGroups.map(colorGroup),
  colorGroup('darkBg'),
]

const ColorSquare = (props: { value: string }) => (
  <div
    tw="w-12 h-12 mr-3 border border-gray-800"
    css={{ backgroundColor: props.value }}
  />
)

const ColorLabel = ({ name, value }: ColorProps) => (
  <div tw="flex flex-col">
    <code tw="mb-3">{name}</code>
    <code>{value}</code>
  </div>
)

export const AllColors: React.FC = () => (
  <div tw="flex flex-wrap">
    {groups.map(([group, colors]) => (
      <div
        key={group}
        tw="flex flex-col flex-wrap"
        css={{ flex: colors.length === 1 ? '1 1 100%' : '0 0 25%' }}
      >
        <h3 tw="capitalize my-4 font-sans">{group}</h3>
        {colors.map(({ name, value }) => (
          <div key={name} tw="flex mb-4">
            <ColorSquare value={value} />
            <ColorLabel value={value} name={name} />
          </div>
        ))}
      </div>
    ))}
  </div>
)
