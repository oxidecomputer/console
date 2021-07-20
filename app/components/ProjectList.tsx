import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import cn from 'classnames'

import { useApiQuery } from '@oxide/api'

import { Icon } from '@oxide/ui'

export interface ProjectListProps {
  className?: string
}

export const ProjectList = (props: ProjectListProps) => {
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
