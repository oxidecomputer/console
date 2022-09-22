import { pb } from './path-builder'

// params can be the same for all of them because they only use what they need
const params = { orgName: 'a', projectName: 'b', instanceName: 'c', vpcName: 'd' }

type Method = keyof typeof pb

// use a record to ensure every key is covered
const cases: Record<Method, string> = {
  orgs: '/orgs',
  orgNew: '/org-new',
  settings: '/settings',
  org: '/orgs/a',
  orgEdit: `/orgs/a/edit`,
  orgAccess: `/orgs/a/access`,
  projects: `/orgs/a/projects`,
  projectNew: `/orgs/a/project-new`,
  project: `/orgs/a/projects/b`,
  projectEdit: `/orgs/a/projects/b/edit`,
  instances: `/orgs/a/projects/b/instances`,
  instanceNew: `/orgs/a/projects/b/instance-new`,
  instance: `/orgs/a/projects/b/instances/c`,
  diskNew: `/orgs/a/projects/b/disk-new`,
  disks: `/orgs/a/projects/b/disks`,
  vpcNew: `/orgs/a/projects/b/vpc-new`,
  vpcs: `/orgs/a/projects/b/vpcs`,
  vpc: `/orgs/a/projects/b/vpcs/d`,
  vpcEdit: `/orgs/a/projects/b/vpcs/d/edit`,
}

test.each(Object.entries(cases))('path for %s', (method, result) => {
  expect(pb[method as Method](params)).toEqual(result)
})
