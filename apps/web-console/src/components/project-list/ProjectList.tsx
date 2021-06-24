import React from 'react'
import tw from 'twin.macro'
import { Link, NavLink } from 'react-router-dom'

import type { ApiProjectView } from '@oxide/api'

import { Icon } from '@oxide/ui'

export interface ProjectListProps {
  className?: string
  projects: ApiProjectView[]
}

export const ProjectList = (props: ProjectListProps) => (
  <section tw="space-y-1" className={props.className}>
    <header tw="p-1 space-x-2 uppercase text-sm">
      <span tw="text-green-500">Projects</span>
      <span tw="text-green-300">{props.projects.length}</span>
    </header>
    <ul tw="flex flex-col uppercase space-y-1">
      {props.projects.map((p) => (
        <li tw="text-xs hover:bg-gray-400" key={p.id} tabIndex={0}>
          <NavLink
            tw="inline-flex w-full p-1"
            to={`/projects/${p.name}`}
            activeStyle={tw`text-green-500`}
          >
            {p.name}
          </NavLink>
        </li>
      ))}
    </ul>
    <footer tw="p-1 flex">
      <Link tw="text-xxs inline-flex" to="/projects/new">
        Create a new project
        <Icon tw="text-sm ml-1" name="plus" />
      </Link>
    </footer>
  </section>
)
