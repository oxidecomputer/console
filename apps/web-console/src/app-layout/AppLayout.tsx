import type { ReactNode } from 'react'
import React from 'react'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { GlobalNav } from '../components/global-nav/GlobalNav'
import { ProjectList } from '../components/project-list/ProjectList'
import { OperationList } from '../components/operation-list/OperationList'
import Wordmark from '../assets/wordmark.svg'

export default (props: { children: ReactNode }) => {
  const { data: projects } = useApiQuery('apiProjectsGet', {})

  return (
    <div className="grid h-screen grid-cols-[14rem,auto] grid-rows-[3.5rem,auto]">
      <div className="flex items-center pl-4 bg-gray-500">
        <Link to="/">
          <Wordmark />
        </Link>
      </div>
      <header className="py-4 px-6 self-center">
        <GlobalNav />
      </header>
      <div className="px-3 pb-6 overflow-auto text-gray-100 bg-gray-500">
        {/* TODO: this causes pop-in when the request comes back */}
        <ProjectList className="mt-1" projects={projects?.items || []} />
        <OperationList className="mt-6" />
      </div>
      <main className="overflow-auto py-2 px-6">{props.children}</main>
    </div>
  )
}
