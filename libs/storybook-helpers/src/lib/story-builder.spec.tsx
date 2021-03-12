import React from 'react'
import { storyBuilder } from './story-builder'

const enumValues = ['one', 'two', 'three'] as const
type EnumValue = typeof enumValues[number]

const otherEnumValues = ['alpha', 'beta'] as const
type OtherEnumValue = typeof otherEnumValues[number]
interface TemplateProps {
  required: string

  optional?: string
  enum?: EnumValue
  otherEnum?: OtherEnumValue
}

const Template: React.FC<TemplateProps> = ({ required, optional }) => (
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

    it('takes multiple top level props, and creates separate entries for each', () => {
      const stories = builder.storiesFor([
        { enum: enumValues },
        { otherEnum: otherEnumValues },
      ])

      expect(Object.keys(stories)).toHaveLength(5)
      expect(stories.one.storyName).toBe('one')
      expect(stories.one.args).toMatchObject({ enum: 'one' })

      expect(stories.two.storyName).toBe('two')
      expect(stories.two.args).toMatchObject({ enum: 'two' })

      expect(stories.three.storyName).toBe('three')
      expect(stories.three.args).toMatchObject({ enum: 'three' })

      expect(stories.alpha.storyName).toBe('alpha')
      expect(stories.alpha.args).toMatchObject({ otherEnum: 'alpha' })

      expect(stories.beta.storyName).toBe('beta')
      expect(stories.beta.args).toMatchObject({ otherEnum: 'beta' })
    })

    it('takes an array of mixed props and combines them, e.g. [{size, children}]', () => {
      const stories = builder.storiesFor({
        enum: enumValues,
        otherEnum: otherEnumValues,
      })

      expect(Object.keys(stories)).toHaveLength(6)
      expect(stories.one_alpha.storyName).toBe('one/alpha')
      expect(stories.one_alpha.args).toMatchObject({
        enum: 'one',
        otherEnum: 'alpha',
      })

      expect(stories.one_beta.storyName).toBe('one/beta')
      expect(stories.one_beta.args).toMatchObject({
        enum: 'one',
        otherEnum: 'beta',
      })

      expect(stories.two_alpha.storyName).toBe('two/alpha')
      expect(stories.two_alpha.args).toMatchObject({
        enum: 'two',
        otherEnum: 'alpha',
      })

      expect(stories.two_beta.storyName).toBe('two/beta')
      expect(stories.two_beta.args).toMatchObject({
        enum: 'two',
        otherEnum: 'beta',
      })

      expect(stories.three_alpha.storyName).toBe('three/alpha')
      expect(stories.three_alpha.args).toMatchObject({
        enum: 'three',
        otherEnum: 'alpha',
      })

      expect(stories.three_beta.storyName).toBe('three/beta')
      expect(stories.three_beta.args).toMatchObject({
        enum: 'three',
        otherEnum: 'beta',
      })
    })
  })
})
