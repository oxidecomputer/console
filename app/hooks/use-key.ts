/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import Mousetrap from 'mousetrap'

import 'mousetrap/plugins/global-bind/mousetrap-global-bind'

import { useEffect, useRef } from 'react'

type Key = Parameters<typeof Mousetrap.bind>[0]
type Callback = Parameters<typeof Mousetrap.bind>[1]

/**
 * Bind a keyboard shortcut with [Mousetrap](https://craig.is/killing/mice).
 * Neither `fn` nor `key` needs to be memoized. If `global`, use
 * `mousetrap-global-bind` to capture key presses from anywhere, including
 * inside textarea/input fields.

 * The `fnRef` trick is to avoid having to memoize the callback in the caller.
 * The keybind effect only runs when the key itself changes, i.e., never. See
 * Dan Abramov's post:
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
export const useKey = (key: Key, fn: Callback, { global = false } = {}) => {
  const fnRef = useRef<Callback>(fn)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  useEffect(() => {
    const bind = global ? Mousetrap.bindGlobal : Mousetrap.bind
    bind(key, (e, combo) => fnRef.current(e, combo))
    return () => {
      Mousetrap.unbind(key)
    }
    // JSON.stringify lets us avoid having to memoize the keys at the call site.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [JSON.stringify(key), global])
}
