# `@oxide/state`

**Table of Contents**

- [Example](#example)
- [API](#api)
  - [`createStore<State>(intialState: State): [Store<State>, useStore<Value>(selector: (state: State) => Value): Value]`](#createstorestateintialstate-state-storestate-usestorevalueselector-state-state--value-value)
    - [`store`](#store)
    - [`useStore<Value>(selector: (state: State) => Value): Value`](#usestorevalueselector-state-state--value-value)
- [History](#history)

## Example

```jsx
import React from 'react'
import { render } from 'react-dom'
import { createStore, useSelector } from '@oxide/state'

// Create a lil' store with some state
let [store, useStore] = createStore({
  count: 0,
})

// The app doesn't need a provider
function App() {
  return (
    <div>
      <Label />
      <Buttons />
    </div>
  )
}

// You can mutate the store from anywhere you want to,
// even outside of React code. Mutate is based on immer.
function increment() {
  store.mutate((state) => {
    state.count++
  })
}

// Or you can update it like React.useState's update
function decrement() {
  store.set((prevState) => ({
    ...prevState,
    count: prevState.count - 1,
  }))
}

// You don't need to pass the store down as a prop either
function Buttons() {
  return (
    <React.Fragment>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </React.Fragment>
  )
}

// Lastly, you can subcribe to "slices" of state by passing a selector to use
// state. The component will only be re-rendered when that portion of state
// re-renders.
function Label() {
  const count = useStore((state) => state.count)
  return <p>The count is {count}</p>
}

render(<App />, window.root)
```

## API

### `createStore<State>(intialState: State): [Store<State>, useStore<Value>(selector: (state: State) => Value): Value]`

Create a `store` given some initial state. The `store` has the following API you can use in or out of React.

#### `store`

| **Method**                                            | **Description**                                                                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `get()`                                               | Get the current state. Do not use this inside of React, you should instead use [`useSelector`](#useselectors-vselector-s-s--v)                  |
| `set(nextState: S \| (prevState: S) => V): void;`     | Set state. This can either take a new value or and updater function (just like React.useState's updater)                                        |
| `on(listener: Function): () => void;`                 | Subscribe to store. Pass in a callback function that will be executed on updates. `on()` returns the unsubscribe function for your convenience. |
| `off(listener: Function): void;`                      | Unsubscribe a given listener function                                                                                                           |
| `reset(): void`                                       | Set state back to the `initialState` used when creating the store                                                                               |
| `mutate(updater: (draft: Draft) => void \| S): void;` | Immer-style updater function.                                                                                                                   |

#### `useStore<Value>(selector: (state: State) => Value): Value`

React hook to subscribe to store state.

```jsx
const selector = (state) => state.count

function Label() {
  const count = useSelector(selector)
  return <p>The count is {count}</p>
}
```

You can use props with a store selector.

```jsx
function User({ id }) {
  const user = useSelector((state) => state.users[id])
  return <p>The username is {user.name}</p>
}
```

## History

This library was originally created by Jared Palmer, forked by Justin Bennett after lack of maintenance, and vendored here for a simpler state management solution.

---

> MIT License
