import { kebabCase } from '@oxide/util'
import type { Config } from 'style-dictionary'
import StyleDictionary from 'style-dictionary'

const THEMES = ['main', 'operator-mode']

const FONT_FAMILIES = {
  'GT America Mono': '"GT America Mono", monospace',
  "Suisse Int'l":
    'SuisseIntl, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif',
}

const percentToRem = (value: string) => {
  return parseFloat(value) / 100 + 'rem'
}
const pxToRem = (value: string | number) =>
  parseFloat(value as string) / 16 + 'rem'
const valueToRem = (value: string | number) =>
  typeof value === 'string' && value.includes('%')
    ? percentToRem(value)
    : pxToRem(value)

const formatFontClass = (name: string) => {
  return name
    .replace('-light', '')
    .replace('-regular', '')
    .replace('-book', '-semi')
}

const formatStyle = (name, value) => {
  name = kebabCase(name)
  if (value === 'none') return null
  switch (name) {
    case 'font-family':
      return [name, FONT_FAMILIES[value]]
    case 'line-height':
      return value === 'AUTO' ? null : [name, valueToRem(value)]
    case 'font-weight': {
      const weight = value.toLowerCase()
      if (weight.includes('light')) {
        return [name, 300]
      } else if (weight.includes('book')) {
        return [name, 500]
      } else {
        return [name, 400]
      }
    }
    case 'paragraph-spacing':
      return null
    case 'text-case':
      return ['text-transform', value]
    case 'font-size':
    case 'letter-spacing':
      return [name, valueToRem(value)]
    default:
      return [name, value]
  }
}

StyleDictionary.registerFormat({
  name: 'theme',
  formatter({ dictionary, options }) {
    const props = dictionary.allProperties.filter(
      (prop) => !prop.name.includes('font-families')
    )
    return `
    ${options.selector} {
      ${props
        .filter((prop) => typeof prop.value !== 'object')
        .map((prop) => `  --${prop.name}: ${prop.value};`)
        .join('\n')}
    }\n

      ${props
        .filter(
          (prop) =>
            prop.type === 'typography' &&
            !prop.name.endsWith('-uncased') &&
            !prop.name.endsWith('-underline')
        )
        .map(
          (prop) => `.text-${formatFontClass(prop.name)} {
          ${Object.entries(prop.value)
            .map(([name, value]) => formatStyle(name, value))
            .filter((style) => style !== null)
            .map(([name, value]) => `${name}: ${value};`)
            .join('\n')}
          }`
        )
        .join('\n')}`
  },
})

StyleDictionary.registerTransform({
  name: 'sizes/rem',
  type: 'value',
  matcher: (prop) => [].includes(prop.attributes?.category),
  transformer: (prop) => valueToRem(prop.original.value),
})

const makeConfig = (theme: string): Config => {
  return {
    source: [`libs/ui/styles/.tokens/${theme}.json`],
    platforms: {
      web: {
        transforms: ['attribute/cti', 'name/cti/kebab', 'sizes/rem'],
        buildPath: 'libs/ui/styles/themes/',
        files: [
          {
            destination: `${theme}.css`,
            format: 'theme',
            options: {
              selector: `.${theme}-theme`,
            },
          },
        ],
      },
    },
  }
}

THEMES.map((theme) => {
  const sd = StyleDictionary.extend(makeConfig(theme))
  sd.buildPlatform('web')
})
