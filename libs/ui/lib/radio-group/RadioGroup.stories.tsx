import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import { Radio, RadioCard } from '../radio/Radio'
import { RadioGroup } from './RadioGroup'

type Story = StoryObj<ComponentProps<typeof RadioGroup>>

export default {
  component: RadioGroup,
} as Story

export const Default = () => (
  <RadioGroup name="group1">
    <Radio value="notify">Comments</Radio>
    <Radio value="do-not-notify">Nothing</Radio>
  </RadioGroup>
)

export const DefaultColumn = () => (
  <RadioGroup name="group2" column>
    <Radio value="50">50 GB</Radio>
    <Radio value="100">100 GB</Radio>
    <Radio value="200">200 GB</Radio>
    <Radio value="300">300 GB</Radio>
    <Radio value="400">400 GB</Radio>
    <Radio value="500">500 GB</Radio>
    <Radio value="600">600 GB</Radio>
  </RadioGroup>
)

export const Cards = () => (
  <RadioGroup name="group3">
    <RadioCard value="50">50 GB</RadioCard>
    <RadioCard value="100">100 GB</RadioCard>
    <RadioCard value="200">200 GB</RadioCard>
    <RadioCard value="300">300 GB</RadioCard>
    <RadioCard value="400">400 GB</RadioCard>
    <RadioCard value="500">500 GB</RadioCard>
    <RadioCard value="600">600 GB</RadioCard>
  </RadioGroup>
)

export const Disabled = () => (
  <RadioGroup name="group4" column disabled>
    <Radio value="50">50 GB</Radio>
    <Radio value="100">100 GB</Radio>
    <Radio value="200">200 GB</Radio>
    <Radio value="300">300 GB</Radio>
    <Radio value="400">400 GB</Radio>
    <Radio value="500">500 GB</Radio>
    <Radio value="600">600 GB</Radio>
  </RadioGroup>
)
