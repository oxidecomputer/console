import React from 'react'
import { theme } from 'twin.macro'

interface ColorProps {
  name?: string
  value: string
}

const EXCLUDE_GROUPS = ['current', 'transparent', 'black', 'white']

type ColorGroup = string | Record<string, string>

const colorConfig = theme`colors` as Record<string, ColorGroup>

const groups = Object.entries(colorConfig).filter(
  ([group, _]) => !EXCLUDE_GROUPS.includes(group)
)

const Color = ({ name, value }: ColorProps) => (
  <div key={name} tw="flex mb-4">
    <div
      tw="w-12 h-12 mr-3 border border-gray-800"
      css={{ backgroundColor: value }}
    />
    <div tw="flex flex-col">
      {name && <code tw="mb-3">{name}</code>}
      <code>{value}</code>
    </div>
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
        <h3 tw="my-4 font-sans font-medium text-lg">{group}</h3>
        {typeof colors === 'string' ? (
          <Color value={colors} />
        ) : (
          Object.entries(colors).map(([name, value]) => (
            <Color key={name} value={value} name={name} />
          ))
        )}
      </div>
    ))}
  </div>
)
