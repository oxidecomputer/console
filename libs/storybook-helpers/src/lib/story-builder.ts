import type { PropsWithChildren } from 'react'
import type { Args, Story } from '@storybook/react'

type StoriesOf<A> = Record<string, Story<A>>

type Variants<B> = readonly B[]

type VariantInput<A> = VariantMap<A> | VariantMap<A>[]
type VariantMap<A> = Partial<Record<keyof A, Variants<A[keyof A]>>>

type KeyMapper<T> = (key: T) => string
interface StoryBuilder<A extends Args> {
  build: (name: string, args?: Partial<PropsWithChildren<A>>) => Story<A>
  storiesFor: (
    values: VariantInput<A>,
    keyMapper?: KeyMapper<keyof A>
  ) => StoriesOf<A>
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

  const storiesFor: StoryBuilder<A>['storiesFor'] = (
    values,
    keyMapper = (a) => a.toString()
  ) => {
    if (Array.isArray(values)) {
      return Object.assign({}, ...values.map((i) => storiesFor(i, keyMapper)))
    }

    const storiesForProp = (
      prop: keyof typeof values,
      vals: Variants<A[keyof A]>
    ): Partial<Record<A[keyof A], Story<A>>> => {
      const [head, ...tail] = vals

      if (!head) return {}

      return {
        [keyMapper(head)]: build(head, { [prop]: head } as Partial<A>),
        ...storiesForProp(prop, tail),
      }
    }

    const args = Object.keys(values) as Array<keyof typeof values>

    return args.reduce((rest, arg) => {
      return {
        ...rest,
        ...storiesForProp(arg, values[arg]),
      }
    }, {})
  }

  return {
    build,
    storiesFor,
  }
}
