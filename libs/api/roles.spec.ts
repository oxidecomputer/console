import {
  getMainRole,
  getOrgRole,
  getProjectRole,
  orgRoleOrder,
  projectRoleOrder,
} from './roles'

const abcViewer = {
  identityId: 'abc',
  roleName: 'viewer',
} as const

const abcCollab = {
  identityId: 'abc',
  roleName: 'collaborator',
} as const

const defAdmin = {
  identityId: 'def',
  roleName: 'admin',
} as const

// not strictly necessary since we're testing the other functions, but it's nice
// to show how it works
describe('getMainRole', () => {
  it('uses role order to choose which role to return', () => {
    const policy = {
      roleAssignments: [
        { identityId: 'abc', roleName: 'x' as const },
        { identityId: 'abc', roleName: 'y' as const },
      ],
    }
    expect(getMainRole({ x: 0, y: 3 })('abc', policy)).toEqual('x')
    expect(getMainRole({ x: 4, y: 1 })('abc', policy)).toEqual('y')
  })
})

describe('getMainProjectRole', () => {
  it('returns null when the list of role assignments is empty', () => {
    expect(getProjectRole('abc', { roleAssignments: [] })).toBeNull()
    expect(getOrgRole('abc', { roleAssignments: [] })).toBeNull()
  })

  it('returns null when there are no assignments for that user ID', () => {
    expect(getProjectRole('abc', { roleAssignments: [defAdmin] })).toBeNull()
    expect(getOrgRole('abc', { roleAssignments: [defAdmin] })).toBeNull()
  })

  it('returns the strongest role when there are multiple roles, regardless of policy order', () => {
    const order1 = [abcViewer, abcCollab, defAdmin]

    expect(getProjectRole('abc', { roleAssignments: order1 })).toEqual('collaborator')
    expect(getProjectRole('def', { roleAssignments: order1 })).toEqual('admin')

    expect(getOrgRole('abc', { roleAssignments: order1 })).toEqual('collaborator')
    expect(getOrgRole('def', { roleAssignments: order1 })).toEqual('admin')

    const order2 = [abcCollab, defAdmin, abcViewer]

    expect(getProjectRole('abc', { roleAssignments: order2 })).toEqual('collaborator')
    expect(getProjectRole('def', { roleAssignments: order2 })).toEqual('admin')

    expect(getOrgRole('abc', { roleAssignments: order2 })).toEqual('collaborator')
    expect(getOrgRole('def', { roleAssignments: order2 })).toEqual('admin')
  })
})

const keyCount = (rec: Record<string, number>) => Object.keys(rec).length
const valueCount = (rec: Record<string, number>) => new Set(Object.values(rec)).size

test('role orders assign a different order number to every role', () => {
  expect(keyCount(projectRoleOrder)).toEqual(valueCount(projectRoleOrder))
  expect(keyCount(orgRoleOrder)).toEqual(valueCount(orgRoleOrder))
})
