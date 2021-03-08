import type { PropsWithChildren } from 'react'
import type { Args, Story } from '@storybook/react'

interface StoryBuilder<A = Args> {
  build: (name: string, args?: Partial<A>) => Story<A>
}

export const storyBuilder = <A extends Args>(
  baseStory: Story<A>,
  defaultArgs: PropsWithChildren<A>
): StoryBuilder<A> => ({
  build: (name, args = {}) => {
    const story: Story<A> = baseStory.bind({})
    story.storyName = name
    story.args = {
      ...defaultArgs,
      ...args,
    }

    return story
  },
})
