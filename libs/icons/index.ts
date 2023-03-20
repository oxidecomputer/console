import type { FunctionComponent, SVGProps } from 'react'

import type { IconName } from './types'

type IconObject = Record<IconName, FunctionComponent<SVGProps<SVGSVGElement>>>

type IconModule = {
  default: FunctionComponent<SVGProps<SVGSVGElement>>
  ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>
}

const modules = import.meta.glob('/node_modules/@oxide/design-system/icons/*.svg', {
  eager: true,
}) as Record<string, IconModule>

const Icon: IconObject = {} as IconObject

for (const path in modules) {
  const key =
    path
      .split('/')
      .pop()
      ?.replace(/\.[^/.]+$/, '') || ''

  if (modules[path]) {
    Icon[toPascalCase(key) as IconName] = modules[path].ReactComponent
  }
}

function toPascalCase(str: string): string {
  const words = str.match(/[A-Za-z0-9]+/g)
  if (!words) return ''
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

export default Icon
