/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'

import { accessTypeLabel, getBadgeColor } from './access'

test('accessTypeLabel', () => {
  expect(accessTypeLabel('silo_group')).toEqual('Group')
  expect(accessTypeLabel('silo_user')).toEqual('User')
})

test('getBadgeColor', () => {
  expect(getBadgeColor('admin')).toEqual('default')
  expect(getBadgeColor('collaborator')).toEqual('purple')
  expect(getBadgeColor('viewer')).toEqual('blue')
})
