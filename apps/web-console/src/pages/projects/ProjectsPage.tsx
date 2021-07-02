import React from 'react'

import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { useBreadcrumbs } from '../../hooks'
import {
  Breadcrumbs,
  Button,
  Icon,
  PageHeader,
  PageTitle,
  SparklineSVG,
} from '@oxide/ui'

const Metric = (props: { label: string; value: string }) => (
  <div>
    <div className="text-gray-200 text-xs tracking-wider uppercase mb-4">
      {props.label}
    </div>
    <div className="flex no-wrap">
      <span className="text-lg font-display font-light mr-4">
        {props.value}
      </span>
      <SparklineSVG className="stroke-current text-green-500" />
    </div>
  </div>
)

const ProjectsPage = () => {
  const breadcrumbs = useBreadcrumbs()
  const { data } = useApiQuery('apiProjectsGet', {})

  if (!data) return <div>loading</div>

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="projects">Projects</PageTitle>
        <div>
          {/* TODO: this is supposed to be a link */}
          <Button variant="ghost">New Project</Button>
          <button className="p-3">
            <Icon name="more" className="text-base text-green-500 mr-4" />
          </button>
        </div>
      </PageHeader>
      {data.items.length === 0 && <div className="mt-4">No projects yet</div>}
      <div className="space-y-4">
        {data.items.map((item) => (
          <article
            key={item.id}
            className="w-full border border-gray-400 rounded-px"
          >
            <section className="p-4">
              <header className="mb-12">
                <Link
                  to={`/projects/${item.name}`}
                  className="font-display font-light tracking-wide text-2xl"
                >
                  {item.name}
                </Link>
              </header>
              <div className="flex mb-8 space-x-16">
                <Metric label="CPU" value="3%" />
                <Metric label="Storage" value="20%" />
                <Metric label="Memory" value="13%" />
                <Metric label="Network" value="5%" />
              </div>
            </section>
            <footer className="p-4 border-t border-gray-400 text-xs">
              <span className="uppercase">12 weeks ago</span>
            </footer>
          </article>
        ))}
      </div>
    </>
  )
}

export default ProjectsPage
