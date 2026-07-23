/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it, test } from 'vitest'

import {
  allRoles,
  byGroupThenName,
  deleteRole,
  getEffectiveRole,
  roleOrder,
  rolesByIdFromPolicy,
  updateRole,
  userScopedRoleEntries,
  type Policy,
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

test('byGroupThenName sorts as expected', () => {
  const a = { identityType: 'silo_group' as const, name: 'a' }
  const b = { identityType: 'silo_group' as const, name: 'b' }
  const c = { identityType: 'silo_user' as const, name: 'c' }
  const d = { identityType: 'silo_user' as const, name: 'd' }
  const e = { identityType: 'silo_user' as const, name: 'e' }

  expect([c, e, b, d, a].sort(byGroupThenName)).toEqual([a, b, c, d, e])
})

describe('rolesByIdFromPolicy', () => {
  it('maps each identity to its role', () => {
    expect(rolesByIdFromPolicy(abcAdminPolicy)).toEqual(new Map([['abc', 'admin']]))
  })

  it('keeps the strongest role when an identity has multiple assignments', () => {
    const policy: Policy = { roleAssignments: [abcViewer, abcAdmin] }
    expect(rolesByIdFromPolicy(policy)).toEqual(new Map([['abc', 'admin']]))
    const reversed: Policy = { roleAssignments: [abcAdmin, abcViewer] }
    expect(rolesByIdFromPolicy(reversed)).toEqual(new Map([['abc', 'admin']]))
  })
})

describe('userScopedRoleEntries', () => {
  it('collapses multiple assignments for the same identity to the strongest role', () => {
    // API permits multiple assignments for one identity in a single policy
    const policy: Policy = {
      roleAssignments: [
        { identityId: 'u', identityType: 'silo_user', roleName: 'viewer' },
        { identityId: 'u', identityType: 'silo_user', roleName: 'admin' },
      ],
    }
    expect(userScopedRoleEntries('u', [], [{ scope: 'silo', policy }])).toEqual([
      { roleName: 'admin', scope: 'silo', source: { type: 'direct' } },
    ])
  })

  it('emits one entry per direct assignment and per group, tagged by scope', () => {
    const group = { id: 'g', displayName: 'g' }
    const silo: Policy = {
      roleAssignments: [
        { identityId: 'g', identityType: 'silo_group', roleName: 'viewer' },
      ],
    }
    const project: Policy = {
      roleAssignments: [{ identityId: 'u', identityType: 'silo_user', roleName: 'admin' }],
    }
    expect(
      userScopedRoleEntries(
        'u',
        [group],
        [
          { scope: 'silo', policy: silo },
          { scope: 'project', policy: project },
        ]
      )
    ).toEqual([
      { roleName: 'viewer', scope: 'silo', source: { type: 'group', group } },
      { roleName: 'admin', scope: 'project', source: { type: 'direct' } },
    ])
  })
})

test('allRoles', () => {
  expect(allRoles).toEqual(['admin', 'collaborator', 'limited_collaborator', 'viewer'])
})
