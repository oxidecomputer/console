import React from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'

import { useApiQuery } from '@oxide/api'
import {
  buttonStyle,
  PageHeader,
  PageTitle,
  Folder24Icon,
  MoreMiscIcon,
} from '@oxide/ui'
import { useParams } from '../hooks'

const ProjectsPage = () => {
  const { orgName } = useParams('orgName')
  const { data } = useApiQuery('organizationProjectsGet', { orgName })

  if (!data) return null

  return (
    <>
      <PageHeader className="mb-10">
        <PageTitle icon={<Folder24Icon title="Projects" />}>Projects</PageTitle>
        <div className="flex items-center">
          <Link to="new" className={buttonStyle({ variant: 'ghost' })}>
            New Project
          </Link>
          <button className="flex items-center p-3">
            <MoreMiscIcon className="mr-4" />
          </button>
        </div>
      </PageHeader>
      {data.items.length === 0 && <div>No projects yet</div>}
      <div className="space-y-4">
        {data.items.map((item) => (
          <article
            key={item.id}
            className="w-full rounded border border-gray-400"
          >
            <section className="p-4">
              <header>
                <Link to={item.name} className="text-sans-xl">
                  {item.name}
                </Link>
              </header>
            </section>
            <footer className="text-xs border-t border-gray-400 p-4">
              <span className="uppercase">
                {formatDistanceToNowStrict(item.timeCreated, {
                  addSuffix: true,
                })}
              </span>
            </footer>
          </article>
        ))}
      </div>
    </>
  )
}

export default ProjectsPage
