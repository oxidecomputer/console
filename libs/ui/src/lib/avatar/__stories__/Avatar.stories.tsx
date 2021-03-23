import React from 'react'
import type { Story } from '@storybook/react'
import type { AvatarProps } from '../Avatar'
import { Avatar, avatarSizes } from '../Avatar'

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />

export const Person = Template.bind({})
const personArgs = { name: 'Cameron Howe', isPerson: true }
Person.args = personArgs

export const Organization = Template.bind({})
const orgArgs = { name: 'Colossal Cave Adventure' }
Organization.args = orgArgs

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
          return {
            ...rest,
            [storyKey]: (() => {
              const Story: Story<AvatarProps> = Template.bind({})
              Story.storyName = storyName

              // Decide on base args to use for this Story
              const baseArgs =
                type === 'organization' ? Organization.args : Person.args

              // If the variant is image, include a source image
              const variantArgs =
                variant === 'image'
                  ? { src: 'http://placekitten.com/500/500' }
                  : { src: undefined }

              Story.args = { ...baseArgs, ...variantArgs, size }
              return Story
            })(),
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
    <Avatar {...personArgs} src="http://placekitten.com/32/32" />
    <Avatar {...orgArgs} />
    <Avatar {...orgArgs} src="http://placekitten.com/100/100" />
  </div>
)

export const AvatarAlignment = AvatarAlignmentTemplate.bind({})
AvatarAlignment.args = { ...Person.args }
