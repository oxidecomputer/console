import type { PropsWithChildren } from 'react'
import React from 'react'
import type { Story } from '@storybook/react'
import { Button, buttonSizes, variants } from '../Button'
import type { ButtonProps, ButtonSize, Variant } from '../Button'

type ButtonStory = Story<PropsWithChildren<ButtonProps>>

const Template: ButtonStory = (args) => <Button {...args} />

export const Default: ButtonStory = Template.bind({})
Default.args = {
  children: 'Button',
  disabled: false,
  size: 'base',
  variant: 'solid',
}

const sizes = buttonSizes.reduce(
  (rest, size) => ({
    ...rest,
    [size]: (() => {
      const Story = Template.bind({})
      Story.storyName = size
      Story.args = { ...Default.args, size }
      return Story
    })(),
  }),
  {} as Record<ButtonSize, Story<ButtonProps>>
)

type VariantSize = `${Variant}_${ButtonSize}`
const variantSizes = variants.reduce(
  (allVariants, variant) => ({
    ...allVariants,
    ...buttonSizes.reduce(
      (allSizes, size) => ({
        ...allSizes,
        [`${variant}_${size}`]: (() => {
          const Story = Template.bind({})
          Story.storyName = `${size} ${variant}`
          Story.args = { ...Default.args, variant, size }
          return Story
        })(),
      }),
      {} as Record<VariantSize, Story<ButtonProps>>
    ),
  }),
  {} as Record<Variant, Record<ButtonSize, Story<ButtonProps>>>
)

export const stories = {
  sizes,
  variants: variantSizes,
}
