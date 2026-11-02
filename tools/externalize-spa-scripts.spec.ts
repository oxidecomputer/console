/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'

import { externalizeScripts } from './externalize-spa-scripts'

test('externalizes framework scripts without changing their order, type, or source', () => {
  const input =
    '<script src="/assets/theme.js"></script><script>window.context = {}</script><script type="module" async="">import "/assets/entry.js"</script><script>window.done = true</script>'
  const { html, scripts } = externalizeScripts(input)
  expect(html.startsWith('<script src="/assets/theme.js"></script>')).toBe(true)
  expect([...scripts.values()]).toEqual([
    'window.context = {}',
    'import "/assets/entry.js"',
    'window.done = true',
  ])
  const filenames = [...scripts.keys()]
  expect(html).toBe(
    `<script src="/assets/theme.js"></script><script data-spa-script src="/assets/${filenames[0]}"></script><script type="module" async="" data-spa-script src="/assets/${filenames[1]}"></script><script data-spa-script src="/assets/${filenames[2]}"></script>`
  )
  expect(externalizeScripts(input)).toEqual({ html, scripts })
  expect(
    [
      ...externalizeScripts(
        input.replace('window.done = true', 'window.done = false')
      ).scripts.keys(),
    ][2]
  ).not.toBe(filenames[2])
})

test('fails the build for scripts that cannot use src', () => {
  expect(() =>
    externalizeScripts('<script type="importmap">{"imports":{}}</script>')
  ).toThrow('Cannot externalize')
})
