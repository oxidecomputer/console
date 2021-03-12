import type { Args, Story } from '@storybook/react'
import { product } from './helpers'

type StoriesOf<A> = Record<string, Story<A>>

type Variants<B> = readonly B[]

type VariantInput<A> = VariantMap<A> | VariantMap<A>[]
type VariantMap<A> = Partial<Record<keyof A, Variants<A[keyof A]>>>

type KeyMapper<T> = (key: T) => string
interface StoryBuilder<A extends Args> {
  build: (name: string, args?: Partial<A>) => Story<A>
  storiesFor: (
    values: VariantInput<A>,
    keyMapper?: KeyMapper<keyof A>
  ) => StoriesOf<A>
}

export const storyBuilder = <A extends Args>(
  baseStory: Story<A>,
  defaultArgs: A
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

  const storiesFor: StoryBuilder<A>['storiesFor'] = (
    values,
    keyMapper = (a) => a.toString()
  ) => {
    if (Array.isArray(values)) {
      return Object.assign({}, ...values.map((i) => storiesFor(i, keyMapper)))
    }

    const args = Object.keys(values) as Array<keyof typeof values>
    const argValues = args.map((key) =>
      values[key].map((v) => ({ [key]: v } as Partial<A>))
    )

    const storyProps = product(...argValues).map((v) =>
      v.reduce((props, a) => ({ ...props, ...a }), {})
    )

    return storyProps.reduce((rest, props) => {
      const values = Object.values(props)
      const storyKey = values.join('_')
      const storyName = values.join('/')

      return {
        ...rest,
        [keyMapper(storyKey)]: build(storyName, props),
      }
    }, {})
  }

  return {
    build,
    storiesFor,
  }
}
