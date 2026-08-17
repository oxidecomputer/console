/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, it } from 'vitest'

import { projects } from './project'

// see ./project.ts for the explanation why these are supposed to be unique

it('mock project data has globally unique project names', () => {
  const names = projects.map((p) => p.name)
  const uniqueNames = new Set(names)
  expect(names.length).toBe(uniqueNames.size)
})
