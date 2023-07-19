/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// @ts-ignore
// import twConfig from '../../../../tailwind.config'

interface ColorProps {
  name?: string
  value: string
}

const EXCLUDE_GROUPS = ['current', 'transparent', 'black', 'white']

type ColorGroup = string | Record<string, string>

const colorConfig = {} as Record<string, ColorGroup>
// const colorConfig = twConfig.theme.colors as Record<string, ColorGroup>

const groups = Object.entries(colorConfig).filter(
  ([group, _]) => !EXCLUDE_GROUPS.includes(group)
)

const Color = ({ name, value }: ColorProps) => (
  <div key={name} className="mb-4 flex">
    <div
      className="mr-3 h-12 w-12 border border-secondary"
      style={{ backgroundColor: value }}
    />
    <div className="flex flex-col">
      {name && <code className="mb-3">{name}</code>}
      <code>{value}</code>
    </div>
  </div>
)

export const AllColors = () => (
  <div className="flex flex-wrap">
    {groups.map(([group, colors]) => (
      <div
        key={group}
        className="flex flex-col flex-wrap"
        style={{ flex: colors.length === 1 ? '1 1 100%' : '0 0 25%' }}
      >
        <h3 className="my-4 text-sans-lg">{group}</h3>
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
