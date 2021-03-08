import React from 'react'
import type { Story } from '@storybook/react'
import { storyBuilder } from './story-builder'

interface TemplateProps {
  required: string

  optional?: string
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

  it("doesn't need to have arguments", () => {
    const story = builder.build('Test Story')

    expect(story.storyName).toBe('Test Story')
    expect(story.args).toMatchObject({ required: 'test' })
  })
})
