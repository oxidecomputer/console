import React from 'react'
import type { Story } from '@storybook/react'
import { storyBuilder } from './story-builder'

const enumValues = ['one', 'two', 'three'] as const
type EnumValue = typeof enumValues[number]
interface TemplateProps {
  required: string

  optional?: string
  enum?: EnumValue
}

const Template: Story<TemplateProps> = ({ required, optional }) => (
  <div>
    <span>{required}</span>
    {optional && <span>{optional}</span>}
  </div>
)

describe('Story Builders', () => {
  const builder = storyBuilder(Template, {
    required: 'test',
  })

  it('builds a story with the given name and args', () => {
    const story = builder.build('Test Story', { optional: 'test2' })

    expect(story.storyName).toBe('Test Story')
    expect(story.args).toMatchObject({ required: 'test', optional: 'test2' })
  })

  it('overwrites default arguments', () => {
    const story = builder.build('Test Story', { required: 'changed' })

    expect(story.storyName).toBe('Test Story')
    expect(story.args).toMatchObject({ required: 'changed' })
  })

  it('does not need to have arguments', () => {
    const story = builder.build('Test Story')

    expect(story.storyName).toBe('Test Story')
    expect(story.args).toMatchObject({ required: 'test' })
  })

  it('accepts children as a valid prop', () => {
    const childrenBuilder = storyBuilder(Template, {
      required: 'test',
      children: 'test',
    })
    const story = childrenBuilder.build('Test Story')

    expect(story.storyName).toBe('Test Story')
    expect(story.args).toMatchObject({
      required: 'test',
      children: 'test',
    })
  })

  it('overrides children as a valid prop', () => {
    const childrenBuilder = storyBuilder(Template, {
      required: 'test',
      children: 'test',
    })
    const story = childrenBuilder.build('Test Story', { children: 'test2' })

    expect(story.storyName).toBe('Test Story')
    expect(story.args).toMatchObject({
      required: 'test',
      children: 'test2',
    })
  })

  describe('storiesFor', () => {
    it('takes a list of variants for a given prop', () => {
      const stories = builder.storiesFor({ enum: enumValues })

      expect(Object.keys(stories)).toHaveLength(3)
      expect(stories.one.storyName).toBe('one')
      expect(stories.one.args).toMatchObject({ enum: 'one' })

      expect(stories.two.storyName).toBe('two')
      expect(stories.two.args).toMatchObject({ enum: 'two' })

      expect(stories.three.storyName).toBe('three')
      expect(stories.three.args).toMatchObject({ enum: 'three' })
    })

    it('accepts an optional key mapper to re-write keys', () => {
      const stories = builder.storiesFor({ enum: enumValues }, (key) =>
        key.toUpperCase()
      )

      expect(stories.one).toBeUndefined()
      expect(stories.ONE.storyName).toBe('one')
      expect(stories.ONE.args).toMatchObject({ enum: 'one' })

      expect(stories.two).toBeUndefined()
      expect(stories.TWO.storyName).toBe('two')
      expect(stories.TWO.args).toMatchObject({ enum: 'two' })

      expect(stories.three).toBeUndefined()
      expect(stories.THREE.storyName).toBe('three')
      expect(stories.THREE.args).toMatchObject({ enum: 'three' })
    })
  })
})
