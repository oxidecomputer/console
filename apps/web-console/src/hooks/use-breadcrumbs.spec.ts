import { breadcrumbsForPath } from './use-breadcrumbs'

const mazeWar = { href: '/', label: 'Maze War' }

describe('breadcrumbsForPath', () => {
  it('handles root path', () => {
    expect(breadcrumbsForPath('/')).toEqual([mazeWar])
  })

  it('works for normal paths', () => {
    expect(breadcrumbsForPath('/projects')).toEqual([
      mazeWar,
      { label: 'projects' },
    ])

    expect(breadcrumbsForPath('/projects/test-project')).toEqual([
      mazeWar,
      { href: '/projects', label: 'projects' },
      { label: 'test-project' },
    ])

    expect(breadcrumbsForPath('/projects/test-project/instances/db1')).toEqual([
      mazeWar,
      { href: '/projects', label: 'projects' },
      { href: '/projects/test-project', label: 'test-project' },
      { href: '/projects/test-project/instances', label: 'instances' },
      { label: 'db1' },
    ])
  })

  it('applies special labels for create pages', () => {
    expect(breadcrumbsForPath('/projects/new')).toEqual([
      mazeWar,
      { href: '/projects', label: 'projects' },
      { label: 'Create project' },
    ])
  })

  it("applies special labels regardless of whether there's other stuff in the path", () => {
    expect(breadcrumbsForPath('/projects/test-project/instances/new')).toEqual([
      mazeWar,
      { href: '/projects', label: 'projects' },
      { href: '/projects/test-project', label: 'test-project' },
      { href: '/projects/test-project/instances', label: 'instances' },
      { label: 'Create instance' },
    ])

    expect(breadcrumbsForPath('/instances/new')).toEqual([
      mazeWar,
      { href: '/instances', label: 'instances' },
      { label: 'Create instance' },
    ])
  })
})
