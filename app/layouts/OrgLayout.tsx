import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import cn from 'classnames'

import { useApiQuery2 as useApiQuery } from '@oxide/api'
import { SkipLinkTarget, Add12Icon } from '@oxide/ui'

import { ContentPane, PageContainer, Sidebar } from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { useParams } from '../hooks'

const ProjectList = (props: { className?: string }) => {
  const { orgName } = useParams('orgName')
  const { data: projects } = useApiQuery('organizationProjectsGet', {
    organizationName: orgName,
  })
  return (
    <section className={cn('space-y-2', props.className)}>
      <header className="p-1 space-x-2 uppercase text-xs font-mono text-green-500">
        Projects
      </header>
      <ul className="space-y-0.5 text-gray-200 font-light text-sm">
        {projects?.items.map((p) => (
          <li className="hover:bg-gray-400" key={p.id}>
            <NavLink
              className="inline-flex w-full p-1"
              to={`/orgs/${orgName}/projects/${p.name}`}
              end
            >
              {p.name}
            </NavLink>
          </li>
        ))}
      </ul>
      <footer className="p-1 flex">
        <Link
          className="text-xs inline-flex uppercase text-gray-100 font-mono"
          to={`/orgs/${orgName}/projects/new`}
        >
          <Add12Icon title="Add a project" className="mr-1.5 mt-0.5" />
          New project
        </Link>
      </footer>
    </section>
  )
}

const OrgLayout = () => (
  <PageContainer>
    <Sidebar>
      <ProjectList className="mt-14 px-3" />
    </Sidebar>
    <ContentPane>
      <Breadcrumbs />
      <SkipLinkTarget />
      <Outlet />
    </ContentPane>
  </PageContainer>
)

export default OrgLayout
