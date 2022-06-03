/**
 * This is a fork of Jared Palmers' mutik, but specifically based off of changes in https://github.com/zephraph/mutik
 *
 * MIT License
 *
 * Copyright (c) 2020 Jared Palmer
 * Copyright (c) 2021 Justin Bennett
 * Copyright (c) 2022 Oxide Computer Company
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import type { Draft } from 'immer'
import produce from 'immer'
import { useSyncExternalStoreWithSelector as useSyncExternalStore } from 'use-sync-external-store/shim/with-selector'

type Listener = () => void

type UpdaterFn<State> = (prevState: State) => State

export interface Store<State> {
  get(): State
  set(nextState: State): void
  set(updater: UpdaterFn<State>): void
  on(listener: Listener): () => void
  off(listener: Listener): void
  reset(): void
  mutate(updater: (draft: Draft<State>) => void | State): void
}

export function createStore<State>(initialState: State) {
  let listeners: Listener[] = []
  let currentState = initialState
  const store = {
    get() {
      return currentState
    },
    set(nextState: State | UpdaterFn<State>) {
      currentState =
        typeof nextState === 'function'
          ? (nextState as UpdaterFn<State>)(currentState)
          : nextState
      listeners.forEach((listener) => listener())
    },
    on(listener: Listener) {
      listeners.push(listener)
      return () => this?.off(listener)
    },
    off(listener: Listener) {
      listeners = listeners.filter((fn) => fn !== listener)
    },
    reset() {
      this.set(initialState)
    },
    mutate(updater: (draft: Draft<State>) => void) {
      const currState = this.get()
      const nextState = produce(currState, updater)
      if (nextState !== currState) this.set(nextState as State)
    },
  }

  function useStore<DerivedValue>(
    selector: (state: State) => DerivedValue = (state) => state as unknown as DerivedValue
  ) {
    const selection = useSyncExternalStore(store.on, store.get, null, selector)
    return selection
  }

  return [store, useStore] as const
}
