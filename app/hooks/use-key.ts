/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import Mousetrap from 'mousetrap'
import { useEffect } from 'react'

type Key = Parameters<typeof Mousetrap.bind>[0]
type Callback = Parameters<typeof Mousetrap.bind>[1]

/**
 * Bind a keyboard shortcut with [Mousetrap](https://craig.is/killing/mice).
 * Callback `fn` should be memoized. `key` does not need to be memoized.
 */
export const useKey = (key: Key, fn: Callback) => {
  useEffect(() => {
    Mousetrap.bind(key, fn)
    return () => {
      Mousetrap.unbind(key)
    }
    // JSON.stringify lets us avoid having to memoize the keys at the call site.
    // Doing something similar with the callback makes less sense.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [JSON.stringify(key), fn])
}
