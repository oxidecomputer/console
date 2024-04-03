/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Combine multiple abort signals into one.
 *
 * Borrowed from: https://github.com/whatwg/fetch/issues/905#issuecomment-1816547024
 *
 * Can be replaced by AbortSignal.any once browser support improves. It is in
 * all major browsers as of March 2024.
 * https://caniuse.com/mdn-api_abortsignal_any_static
 */
export function anySignal(signals: Array<AbortSignal | undefined>): AbortSignal {
  const controller = new AbortController()

  for (const signal of signals) {
    if (!signal) continue

    // if any are already aborted, abort
    if (signal.aborted) {
      controller.abort(signal.reason)
      return controller.signal
    }

    signal.addEventListener('abort', () => controller.abort(signal.reason), {
      once: true,
      signal: controller.signal,
    })
  }

  return controller.signal
}
