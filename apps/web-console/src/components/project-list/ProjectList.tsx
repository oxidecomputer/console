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
  <section className={cn('space-y-1', props.className)}>
    <header className="p-1 space-x-2 uppercase text-sm">
      <span className="text-green-500">Projects</span>
    </header>
    <ul className="flex flex-col uppercase space-y-1">
      {props.projects.map((p) => (
        <li className="text-xs hover:bg-gray-400" key={p.id} tabIndex={0}>
          <NavLink
            className="inline-flex w-full p-1"
            to={`/projects/${p.name}`}
            activeClassName="text-green-500"
          >
            {p.name}
          </NavLink>
        </li>
      ))}
    </ul>
    <footer className="p-1 flex">
      <Link className="text-xxs inline-flex" to="/projects/new">
        Create a new project
        <Icon className="text-sm ml-1" name="plus" />
      </Link>
    </footer>
  </section>
)
