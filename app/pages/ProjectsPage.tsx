import React from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'

import { useApiQuery } from '@oxide/api'
import {
  buttonStyle,
  PageHeader,
  PageTitle,
  FolderLargeIcon,
  MoreMiscIcon,
} from '@oxide/ui'
import SparklineSVG from '../assets/sparkline.svg'

type MetricProps = {
  label: string
  value: string
  className?: string
}

const Metric = ({ label, value, className }: MetricProps) => (
  <div className={className}>
    <div className="text-gray-200 text-xs font-mono uppercase mb-4">
      {label}
    </div>
    <div className="flex">
      <div className="text-display-lg mr-4">{value}</div>
      <div>
        <SparklineSVG className="stroke-current text-green-500 w-full" />
      </div>
    </div>
  </div>
)

const ProjectsPage = () => {
  const { data } = useApiQuery('projectsGet', {})

  if (!data) return <div>loading</div>

  return (
    <>
      <PageHeader className="mb-10">
        <PageTitle icon={<FolderLargeIcon title="Projects" />}>
          Projects
        </PageTitle>
        <div className="flex items-center">
          <Link
            to="/projects/new"
            className={buttonStyle({ variant: 'ghost' })}
          >
            New Project
          </Link>
          <button className="p-3 flex items-center">
            <MoreMiscIcon title="More" className="mr-4" />
          </button>
        </div>
      </PageHeader>
      {data.items.length === 0 && <div>No projects yet</div>}
      <div className="space-y-4">
        {data.items.map((item) => (
          <article
            key={item.id}
            className="w-full border border-gray-400 rounded"
          >
            <section className="p-4">
              <header className="mb-12">
                <Link to={`/projects/${item.name}`} className="text-display-xl">
                  {item.name}
                </Link>
              </header>
              <div className="flex mb-8 space-x-8 lg:space-x-12">
                <Metric label="CPU" value="3%" />
                <Metric label="Memory" value="13%" />
                <Metric
                  label="Storage"
                  value="20%"
                  className="hidden md:block"
                />
                <Metric
                  label="Network"
                  value="5%"
                  className="hidden lg:block"
                />
              </div>
            </section>
            <footer className="p-4 border-t border-gray-400 text-xs">
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
