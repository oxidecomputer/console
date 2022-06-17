import type { ProjectRolePolicy } from './__generated__/Api'
import {
  getMainRole,
  getOrgRole,
  getProjectRole,
  orgRoleOrder,
  projectRoleOrder,
  setUserRole,
} from './roles'

// not strictly necessary since we're testing the other functions, but it's nice
// to show how it works
describe('getMainRole', () => {
  it('uses role order to choose which role to return', () => {
    expect(getMainRole({ x: 0, y: 3 })(['x', 'y'])).toEqual('x')
    expect(getMainRole({ x: 4, y: 1 })(['x', 'y'])).toEqual('y')
  })
})

describe('getMainProjectRole', () => {
  it('returns null when the list of role assignments is empty', () => {
    expect(getProjectRole([])).toBeNull()
    expect(getOrgRole([])).toBeNull()
  })

  it('returns the strongest role when there are multiple roles, regardless of policy order', () => {
    expect(getProjectRole(['admin', 'collaborator'])).toEqual('admin')
    expect(getProjectRole(['collaborator', 'admin'])).toEqual('admin')

    expect(getOrgRole(['collaborator', 'viewer'])).toEqual('collaborator')
    expect(getOrgRole(['viewer', 'collaborator'])).toEqual('collaborator')
  })

  it("type errors when passed a role that's not in the enum", () => {
    // @ts-expect-error
    getProjectRole(['fake!'])
    // @ts-expect-error
    getOrgRole(['fake!'])
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
