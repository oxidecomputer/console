import React from 'react'
import type { Story } from '@storybook/react'

import type { RadioFieldProps } from '../RadioField'
import { RadioField } from '../RadioField'

const Template: Story<RadioFieldProps> = (args) => <RadioField {...args} />

export const Default = Template.bind({})
Default.args = {
  children: 'Automatically format and mount',
  hint: 'Some details about automatically formatting and mounting disks.',
  value: 'default',
}

export const Checked = Template.bind({})
Checked.args = {
  checked: true,
  children: 'Remember Me',
  value: 'is-checked',
}

export const withHint = Template.bind({})
withHint.args = {
  children: 'Comments',
  hint: 'Get notified when someones posts a comment on a posting.',
  name: 'group',
  value: 'with-hint',
}

type CreateStory = (args: RadioFieldProps) => Story<RadioFieldProps>

const createStoryGroup: CreateStory = (args) =>
  (() => {
    const Story = Template.bind({})
    Story.args = args
    return Story
  })()

const suffixes = ['default', 'hint', 'checked'] as const

type StorySuffix = typeof suffixes[number]
type VariantKey = `card_twoLines_${StorySuffix}` | `card_single_${StorySuffix}`

const variants = {} as Record<VariantKey, Story<RadioFieldProps>>

// Build up the `variants` object using the story suffixes
suffixes.forEach((storySuffix, index) => {
  const commonArgs: RadioFieldProps = {
    checked: storySuffix === 'checked' ? true : undefined,
    hint: storySuffix === 'hint' ? 'More details here' : undefined,
    value: `radio${index + 1}`,
    variant: 'card',
  }

  // Create "Two Lines" Card variations
  const twoLinesKey = `card_twoLines_${storySuffix}` as VariantKey
  variants[twoLinesKey] = createStoryGroup({
    ...commonArgs,
    children: (
      <>
        <span>{index + 1} CPUs</span>
        <br />
        <span>{2 * (index + 2)} GB RAM</span>
      </>
    ),
    name: 'group1',
  })

  // Create "Single Line" Card variations
  const singleKey = `card_single_${storySuffix}` as VariantKey
  variants[singleKey] = createStoryGroup({
    ...commonArgs,
    children: `${index + 1}00 GB`,
    name: 'group2',
  })
})

export const stories = {
  variants: variants,
}
