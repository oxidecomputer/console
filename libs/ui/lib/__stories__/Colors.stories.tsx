import React from 'react'
// @ts-ignore
import twConfig from '../../../../tailwind.config'

interface ColorProps {
  name?: string
  value: string
}

const EXCLUDE_GROUPS = ['current', 'transparent', 'black', 'white']

type ColorGroup = string | Record<string, string>

const colorConfig = twConfig.theme.colors as Record<string, ColorGroup>

const groups = Object.entries(colorConfig).filter(
  ([group, _]) => !EXCLUDE_GROUPS.includes(group)
)

const Color = ({ name, value }: ColorProps) => (
  <div key={name} className="flex mb-4">
    <div
      className="w-12 h-12 mr-3 border border-gray-400"
      css={{ backgroundColor: value }}
    />
    <div className="flex flex-col">
      {name && <code className="mb-3">{name}</code>}
      <code>{value}</code>
    </div>
  </div>
)

export const AllColors: React.FC = () => (
  <div className="flex flex-wrap">
    {groups.map(([group, colors]) => (
      <div
        key={group}
        className="flex flex-col flex-wrap"
        css={{ flex: colors.length === 1 ? '1 1 100%' : '0 0 25%' }}
      >
        <h3 className="my-4 font-sans font-medium text-lg">{group}</h3>
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
