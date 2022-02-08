import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import cn from 'classnames'

import { useApiQuery } from '@oxide/api'
import { SkipLinkTarget, Add12Icon } from '@oxide/ui'

import {
  ContentPane,
  ContentPaneWrapper,
  PageContainer,
  Sidebar,
} from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { TopBar } from '../components/TopBar'
import { useParams } from '../hooks'

const ProjectList = (props: { className?: string }) => {
  const { orgName } = useParams('orgName')
  const { data: projects } = useApiQuery('organizationProjectsGet', { orgName })
  return (
    <section className={cn('space-y-2', props.className)}>
      <header className="text-xs space-x-2 p-1 text-mono-md text-green-500">
        Projects
      </header>
      <ul className="text-sm space-y-0.5 font-light text-gray-200">
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
      <footer className="flex p-1">
        <Link
          className="text-xs inline-flex text-mono-md text-gray-100"
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
    <ContentPaneWrapper>
      <ContentPane>
        <TopBar />
        <Breadcrumbs />
        <SkipLinkTarget />
        <Outlet />
      </ContentPane>
    </ContentPaneWrapper>
  </PageContainer>
)

export default OrgLayout
