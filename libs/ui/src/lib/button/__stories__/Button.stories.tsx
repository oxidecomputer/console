import type { PropsWithChildren } from 'react'
import React from 'react'
import type { Story } from '@storybook/react'
import { Button, buttonSizes, variants } from '../Button'
import type { ButtonProps, ButtonSize, Variant } from '../Button'
import { Icon } from '../../icon/Icon'
import { storyBuilder } from '@oxide/storybook-helpers'

type ButtonStory = Story<PropsWithChildren<ButtonProps>>

const Template: ButtonStory = (args) => <Button {...args} />

export const Default: ButtonStory = Template.bind({})
Default.args = {
  children: 'Button',
  disabled: false,
  size: 'base',
  variant: 'solid',
}

const builder = storyBuilder(Template, {
  children: 'Button',
  disabled: false,
  size: 'base',
  variant: 'solid',
})

const sizes = buttonSizes.reduce(
  (rest, size) => ({
    ...rest,
    [size]: builder.build(size, { size }),
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
        [`${variant}_${size}`]: builder.build(`${size} ${variant}`, {
          variant,
          size,
        }),
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
        [`icon_${variant}_${size}`]: builder.build(`Icon: ${size} ${variant}`, {
          ...Default.args,
          variant,
          size,
          children: (
            <>
              <Icon name="pen" align="left" />
              Edit
            </>
          ),
        }),
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
