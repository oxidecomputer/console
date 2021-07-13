import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import cn from 'classnames'

import type { ApiProjectView } from '@oxide/api'

import { Icon } from '@oxide/ui'

export interface ProjectListProps {
  className?: string
  projects: ApiProjectView[]
}

export const ProjectList = (props: ProjectListProps) => (
  <section className={cn('space-y-2', props.className)}>
    <header className="p-1 space-x-2 uppercase text-xs font-mono text-green-500">
      Projects
    </header>
    <ul className="flex flex-col space-y-1 text-gray-200">
      {props.projects.map((p) => (
        <li className="text-sm hover:bg-gray-400" key={p.id}>
          <NavLink
            className="inline-flex w-full p-1"
            to={`/projects/${p.name}`}
            activeClassName="text-white"
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
