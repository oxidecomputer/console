import type { Story } from '@storybook/react'
import { storyBuilder } from '@oxide/storybook-helpers'
import { Text, textSizes } from '../Text'
import type { TextSize, TextProps } from '../Text'

const builder = storyBuilder(Text, {})

const numbers = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
]
const mapKey = (key: string) => {
  if (/^(\d)/.test(key)) {
    const [idx, ...letters] = key.split('')
    const n = parseInt(idx, 10)
    return [numbers[n], '_', ...letters].join('')
  }

  return key
}

export const textSizeStories = textSizes.reduce(
  (rest, size) => ({
    ...rest,
    [mapKey(size)]: builder.build(size, {
      size,
      children: `'${size}' size text`,
    }),
  }),
  {} as Record<TextSize, Story<TextProps>>
)

export const stories = {
  default: builder.build('Default', {
    children: `Text will render as a 'span' by default.`,
  }),
  asPTag: builder.build('Render as `p` tag', {
    as: 'p',
    children: `Text can be rendered in a <p> tag using the 'as' prop.`,
  }),
  withIcon: builder.build('With Icon', {
    icon: { name: 'plus' },
    children: 'Create a new project',
  }),
  withRightIcon: builder.build('With Right Icon', {
    size: 'xs',
    icon: { align: 'right', name: 'plus' },
    children: 'Create a new project',
  }),
  titleWithIcon: builder.build('Title with Icon', {
    icon: { name: 'dashboard' },
    variant: 'title',
    children: 'Page title',
  }),
  titleVariant: builder.build('Title Variant', {
    variant: 'title',
    children: 'Title Text Variant',
  }),
}
