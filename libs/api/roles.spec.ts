import type { Policy, SessionMe } from './roles'
import { getEffectiveRole, roleOrder, setUserRole, userRoleFromPolicies } from './roles'

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

const abcAdmin: Policy = {
  roleAssignments: [{ identityId: 'abc', identityType: 'silo_user', roleName: 'admin' }],
}

const abcViewer: Policy = {
  roleAssignments: [{ identityId: 'abc', identityType: 'silo_user', roleName: 'viewer' }],
}

describe('setUserRole', () => {
  it('adds a user', () => {
    expect(setUserRole('abc', 'admin', emptyPolicy)).toEqual(abcAdmin)
  })

  it('overrides an existing user', () => {
    expect(setUserRole('abc', 'viewer', abcAdmin)).toEqual(abcViewer)
  })

  it('deletes a user when passed a roleId of null', () => {
    expect(setUserRole('abc', null, abcViewer)).toEqual(emptyPolicy)
  })
})

const user1: SessionMe = {
  id: 'hi',
  displayName: 'bye',
  siloId: 'sigh',
  groupIds: ['group1', 'group2'],
}

describe('getEffectiveRole', () => {
  it('returns null when there are no policies', () => {
    expect(userRoleFromPolicies(user1, [])).toBe(null)
  })

  it('returns null when there are no roles', () => {
    expect(userRoleFromPolicies(user1, [{ roleAssignments: [] }])).toBe(null)
  })

  it('returns role if user matches directly', () => {
    expect(
      userRoleFromPolicies(user1, [
        {
          roleAssignments: [
            { identityId: 'hi', identityType: 'silo_user', roleName: 'admin' },
          ],
        },
      ])
    ).toEqual('admin')
  })

  it('returns strongest role if both group and user match', () => {
    expect(
      userRoleFromPolicies(user1, [
        {
          roleAssignments: [
            { identityId: 'hi', identityType: 'silo_user', roleName: 'viewer' },
            { identityId: 'group1', identityType: 'silo_group', roleName: 'collaborator' },
          ],
        },
      ])
    ).toEqual('collaborator')
  })

  it('ignores groups and users that do not match', () => {
    expect(
      userRoleFromPolicies(user1, [
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
      userRoleFromPolicies(user1, [
        {
          roleAssignments: [
            { identityId: 'hi', identityType: 'silo_user', roleName: 'viewer' },
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
