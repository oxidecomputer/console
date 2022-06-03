import { useEffect, useLayoutEffect } from 'react'
import { createStore } from '../state'
import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import ReactDOM from 'react-dom'

type State = {
  count: number
}

it('uses the store with no args', async () => {
  const [store, useStore] = createStore<State>({
    count: 0,
  })

  function Counter() {
    const { count } = useStore()
    useEffect(() => store.set({ count: count + 1 }), [count])
    return <div>count: {count}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 1')
})

it('uses the store with selectors', async () => {
  const [store, useStore] = createStore<State>({
    count: 0,
  })

  function Counter() {
    const count = useStore((state) => state.count)
    useEffect(() => store.set({ count: count + 1 }), [count])
    return <div>count: {count}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 1')
})

it('uses the store with mutate', async () => {
  const [store, useStore] = createStore<State>({
    count: 0,
  })

  function Counter() {
    const count = useStore((state) => state.count)
    useEffect(() => store.mutate((draft) => void draft.count++), [])
    return <div>count: {count}</div>
  }

  const { findByText } = render(<Counter />)

  await findByText('count: 1')
})

it('only re-renders if the selected state changes', async () => {
  const [store, useStore] = createStore<State>({
    count: 0,
  })
  let counterRenderCount = 0
  let controlRenderCount = 0

  function Counter() {
    const count = useStore((state) => state.count)
    counterRenderCount++
    return <div>count: {count}</div>
  }

  function Control() {
    controlRenderCount++
    return (
      <button onClick={() => store.mutate((draft) => void draft.count++)}>button</button>
    )
  }

  const { getByText, findByText } = render(
    <>
      <Counter />
      <Control />
    </>
  )

  fireEvent.click(getByText('button'))

  await findByText('count: 1')

  expect(counterRenderCount).toBe(2)
  expect(controlRenderCount).toBe(1)
})

it('re-renders with useLayoutEffect', async () => {
  const [store, useStore] = createStore<{ state: boolean }>({
    state: false,
  })

  function Component() {
    const { state } = useStore()
    useLayoutEffect(() => {
      store.set({ state: true })
    }, [])
    return <>{`${state}`}</>
  }

  const container = document.createElement('div')
  ReactDOM.render(<Component />, container)
  await waitFor(() => {
    expect(container.innerHTML).toBe('true')
  })
  ReactDOM.unmountComponentAtNode(container)
})

it('can update the selector', async () => {
  type State = { one: string; two: string }
  type Selector = (state: State) => State[keyof State]
  const [, useStore] = createStore<State>({
    one: 'one',
    two: 'two',
  })

  function Component({ selector }: { selector: Selector }) {
    return <div>{useStore(selector)}</div>
  }

  const { findByText, rerender } = render(<Component selector={(s) => s.one} />)
  await findByText('one')

  rerender(<Component selector={(s) => s.two} />)
  await findByText('two')
})
