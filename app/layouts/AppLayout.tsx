import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import cn from 'classnames'

import { useApiQuery } from '@oxide/api'
import { Icon } from '@oxide/ui'

import { GlobalNav } from '../components/GlobalNav'
import Wordmark from '../assets/wordmark.svg'

const ProjectList = (props: { className?: string }) => {
  const { data: projects } = useApiQuery('projectsGet', {})
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
              to={`/projects/${p.name}`}
              activeClassName="text-white"
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
          to="/projects/new"
        >
          <Icon className="text-sm mr-1" name="plus" />
          New project
        </Link>
      </footer>
    </section>
  )
}

export default () => (
  <div className="grid h-screen grid-cols-[14rem,auto] grid-rows-[4.5rem,auto]">
    <div className="flex items-center pl-4 bg-gray-500 leading-none">
      <Link to="/">
        <Wordmark />
      </Link>
    </div>
    <header className="py-4 px-6 self-center">
      <GlobalNav />
    </header>
    <div className="pb-6 overflow-auto bg-gray-500">
      <ProjectList className="mt-4 px-3" />
    </div>
    <main className="overflow-auto py-2 px-6">
      <Outlet />
    </main>
  </div>
)
