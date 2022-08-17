import type { ProjectRolePolicy } from './__generated__/Api'
import {
  getEffectiveOrgRole,
  getEffectiveProjectRole,
  orgRoleOrder,
  projectRoleOrder,
  setUserRole,
} from './roles'

describe('getEffectiveProjectRole and getEffectiveOrgRole', () => {
  it('returns falsy when the list of role assignments is empty', () => {
    expect(getEffectiveProjectRole([])).toBeFalsy()
    expect(getEffectiveOrgRole([])).toBeFalsy()
  })

  it('returns the strongest role when there are multiple roles, regardless of policy order', () => {
    expect(getEffectiveProjectRole(['admin', 'collaborator'])).toEqual('admin')
    expect(getEffectiveProjectRole(['collaborator', 'admin'])).toEqual('admin')

    expect(getEffectiveOrgRole(['collaborator', 'viewer'])).toEqual('collaborator')
    expect(getEffectiveOrgRole(['viewer', 'collaborator'])).toEqual('collaborator')
  })

  it("type errors when passed a role that's not in the enum", () => {
    // @ts-expect-error
    getEffectiveProjectRole(['fake!'])
    // @ts-expect-error
    getEffectiveOrgRole(['fake!'])
  })
})

const keyCount = (rec: Record<string, number>) => Object.keys(rec).length
const valueCount = (rec: Record<string, number>) => new Set(Object.values(rec)).size

test('role orders assign a different order number to every role', () => {
  expect(keyCount(projectRoleOrder)).toEqual(valueCount(projectRoleOrder))
  expect(keyCount(orgRoleOrder)).toEqual(valueCount(orgRoleOrder))
})

const emptyPolicy = { roleAssignments: [] }

const abcAdmin: ProjectRolePolicy = {
  roleAssignments: [{ identityId: 'abc', identityType: 'silo_user', roleName: 'admin' }],
}

const abcViewer: ProjectRolePolicy = {
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
