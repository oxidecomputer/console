import type { PropsWithChildren } from 'react'
import React from 'react'
import type { Story } from '@storybook/react'
import 'twin.macro'

import { Button, buttonSizes, variants } from '../Button'
import type { ButtonProps, ButtonSize, Variant } from '../Button'
import { Icon } from '../../icon/Icon'

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
          Story.storyName = `${variant} ${size}`
          Story.args = {
            ...Default.args,
            variant,
            size,
          }
          return Story
        })(),
      }),
      {} as Record<VariantSize, Story<ButtonProps>>
    ),
  }),
  {} as Record<Variant, Record<ButtonSize, Story<ButtonProps>>>
)

const withIcons = variants.reduce(
  (allVariants, variant) => ({
    ...allVariants,
    ...buttonSizes.reduce(
      (allSizes, size) => ({
        ...allSizes,
        [`icon_${variant}_${size}`]: (() => {
          const Story = Template.bind({})
          Story.storyName = `${variant} with icon ${size}`
          Story.args = {
            ...Default.args,
            variant,
            size,
            children: (
              <>
                <Icon name="pen" tw="mr-2" />
                Edit
              </>
            ),
          }
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
  withIcons: withIcons,
}
