import type { PropsWithChildren } from 'react'
import type { Args, Story } from '@storybook/react'

type StoriesOf<A> = Record<string, Story<A>>

type Variants<B> = readonly B[]

type VariantMap<A> = Partial<Record<keyof A, Variants<A[keyof A]>>>

interface StoryBuilder<A = Args> {
  build: (name: string, args?: Partial<A>) => Story<A>
  storiesFor: (values: VariantMap<A>) => StoriesOf<A>
}

export const storyBuilder = <A extends Args>(
  baseStory: Story<A>,
  defaultArgs: PropsWithChildren<A>
): StoryBuilder<A> => {
  const build: StoryBuilder<A>['build'] = (name, args = {}) => {
    const story: Story<A> = baseStory.bind({})
    story.storyName = name
    story.args = {
      ...defaultArgs,
      ...args,
    }

    return story
  }

  const storiesFor: StoryBuilder<A>['storiesFor'] = (values) => {
    const args = Object.keys(values) as Array<keyof typeof values>

    return args.reduce((rest, arg) => {
      const argValues = values[arg]
      return {
        ...rest,
        ...argValues.reduce((rest, v) => {
          const args = { [arg]: v } as Partial<A>
          return {
            ...rest,
            [v]: build(v, args),
          }
        }, {}),
      }
    }, {})
  }

  return {
    build,
    storiesFor,
  }
}
