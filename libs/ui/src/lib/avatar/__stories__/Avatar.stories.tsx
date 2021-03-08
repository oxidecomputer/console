import React from 'react'
import type { Story } from '@storybook/react'
import { storyBuilder } from '@oxide/storybook-helpers'
import type { AvatarProps } from '../Avatar'
import { Avatar, avatarSizes } from '../Avatar'

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />

const personBuilder = storyBuilder(Template, {
  name: 'Cameron Howe',
  isPerson: true,
})
export const Person = personBuilder.build('Person', {})

const organizationBuilder = storyBuilder(Template, {
  name: 'Collosal Cave Adventure',
})
export const Organization = organizationBuilder.build('Organization', {})

const types = ['organization', 'person'] as const
const variants = ['image', 'fallback'] as const

export const stories = types.reduce(
  (rest, type) => ({
    ...rest,
    ...variants.reduce(
      (rest, variant) => ({
        ...rest,
        ...avatarSizes.reduce((rest, size) => {
          const storyNameParts = [type, variant, size]
          const storyName = storyNameParts.join('/')
          const storyKey = storyNameParts.join('_')
          const builder =
            type === 'person' ? personBuilder : organizationBuilder
          const variantArgs =
            variant === 'image'
              ? { src: 'http://placekitten.com/500/500' }
              : { src: undefined }

          return {
            ...rest,
            [storyKey]: builder.build(storyName, { ...variantArgs, size }),
          }
        }, {}),
      }),
      {}
    ),
  }),
  {} as Record<string, Story<AvatarProps>>
)

const AvatarAlignmentTemplate: Story<AvatarProps> = (args) => (
  <div>
    <Avatar {...args} />
    <Avatar name="Cameron Howe" isPerson src="http://placekitten.com/32/32" />
    <Avatar name="Collosal Cave Adventure" />
    <Avatar
      name="Collosal Cave Adventure"
      src="http://placekitten.com/100/100"
    />
  </div>
)

export const AvatarAlignment = AvatarAlignmentTemplate.bind({})
AvatarAlignment.args = { ...Person.args }
