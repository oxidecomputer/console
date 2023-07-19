/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it, test } from 'vitest'

import {
  type Policy,
  byGroupThenName,
  deleteRole,
  getEffectiveRole,
  roleOrder,
  updateRole,
  userRoleFromPolicies,
} from './roles'

describe('getEffectiveRole', () => {
  it('returns falsy when the list of role assignments is empty', () => {
    expect(getEffectiveRole([])).toBeFalsy()
  })

  it('returns the strongest role when there are multiple roles, regardless of policy order', () => {
    expect(getEffectiveRole(['admin', 'collaborator'])).toEqual('admin')
    expect(getEffectiveRole(['collaborator', 'admin'])).toEqual('admin')
  })

  it("type errors when passed a role that's not in the enum", () => {
    // @ts-expect-error
    getEffectiveRole(['fake!'])
  })
})

const keyCount = (rec: Record<string, number>) => Object.keys(rec).length
const valueCount = (rec: Record<string, number>) => new Set(Object.values(rec)).size

test('role order assigns a different order number to every role', () => {
  expect(keyCount(roleOrder)).toEqual(valueCount(roleOrder))
})

const emptyPolicy = { roleAssignments: [] }

const abcAdmin = {
  identityId: 'abc',
  identityType: 'silo_user',
  roleName: 'admin',
} as const

const abcAdminPolicy: Policy = { roleAssignments: [abcAdmin] }

const abcViewer = {
  identityId: 'abc',
  identityType: 'silo_user',
  roleName: 'viewer',
} as const

const abcViewerPolicy: Policy = { roleAssignments: [abcViewer] }

describe('updateRole', () => {
  it('adds a user', () => {
    expect(updateRole(abcAdmin, emptyPolicy)).toEqual(abcAdminPolicy)
  })

  it('overrides an existing user', () => {
    expect(updateRole(abcViewer, abcAdminPolicy)).toEqual(abcViewerPolicy)
  })
})

describe('deleteRole', () => {
  it('deletes a user by ID', () => {
    expect(deleteRole('abc', abcViewerPolicy)).toEqual(emptyPolicy)
  })
})

const user1 = {
  id: 'user1',
}

const groups = [{ id: 'group1' }, { id: 'group2' }]

describe('getEffectiveRole', () => {
  it('returns null when there are no policies', () => {
    expect(userRoleFromPolicies(user1, groups, [])).toBe(null)
  })

  it('returns null when there are no roles', () => {
    expect(userRoleFromPolicies(user1, groups, [{ roleAssignments: [] }])).toBe(null)
  })

  it('returns role if user matches directly', () => {
    expect(
      userRoleFromPolicies(user1, groups, [
        {
          roleAssignments: [
            { identityId: 'user1', identityType: 'silo_user', roleName: 'admin' },
          ],
        },
      ])
    ).toEqual('admin')
  })

  it('returns strongest role if both group and user match', () => {
    expect(
      userRoleFromPolicies(user1, groups, [
        {
          roleAssignments: [
            { identityId: 'user1', identityType: 'silo_user', roleName: 'viewer' },
            { identityId: 'group1', identityType: 'silo_group', roleName: 'collaborator' },
          ],
        },
      ])
    ).toEqual('collaborator')
  })

  it('ignores groups and users that do not match', () => {
    expect(
      userRoleFromPolicies(user1, groups, [
        {
          roleAssignments: [
            { identityId: 'other', identityType: 'silo_user', roleName: 'viewer' },
            { identityId: 'group3', identityType: 'silo_group', roleName: 'viewer' },
          ],
        },
      ])
    ).toEqual(null)
  })

  it('resolves multiple policies', () => {
    expect(
      userRoleFromPolicies(user1, groups, [
        {
          roleAssignments: [
            { identityId: 'user1', identityType: 'silo_user', roleName: 'viewer' },
          ],
        },
        {
          roleAssignments: [
            { identityId: 'group1', identityType: 'silo_group', roleName: 'admin' },
          ],
        },
      ])
    ).toEqual('admin')
  })
})

test('byGroupThenName sorts as expected', () => {
  const a = { identityType: 'silo_group' as const, name: 'a' }
  const b = { identityType: 'silo_group' as const, name: 'b' }
  const c = { identityType: 'silo_user' as const, name: 'c' }
  const d = { identityType: 'silo_user' as const, name: 'd' }
  const e = { identityType: 'silo_user' as const, name: 'e' }

  expect([c, e, b, d, a].sort(byGroupThenName)).toEqual([a, b, c, d, e])
})
