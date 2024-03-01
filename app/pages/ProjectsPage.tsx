/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Project,
} from '@oxide/api'
import { EmptyMessage, Folder24Icon, PageHeader, PageTitle, TableActions } from '@oxide/ui'

import { DateCell } from '~/table/cells/DateCell'
import { linkCell } from '~/table/cells/LinkCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { confirmDelete } from 'app/stores/confirm-delete'
import { pb } from 'app/util/path-builder'

import { useQuickActions } from '../hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No projects"
    body="You need to create a project to be able to see it here"
    buttonText="New project"
    buttonTo={pb.projectNew()}
  />
)

ProjectsPage.loader = async () => {
  await apiQueryClient.prefetchQuery('projectList', { query: { limit: 25 } })
  return null
}

export default function ProjectsPage() {
  const navigate = useNavigate()

  const queryClient = useApiQueryClient()
  const { Table, Column } = useQueryTable('projectList', {})
  const { data: projects } = usePrefetchedApiQuery('projectList', {
    query: { limit: 25 }, // limit to match QueryTable
  })

  const deleteProject = useApiMutation('projectDelete', {
    onSuccess() {
      // TODO: figure out if this is invalidating as expected, can we leave out the query
      // altogether, etc. Look at whether limit param matters.
      queryClient.invalidateQueries('projectList')
    },
  })

  const makeActions = (project: Project): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => {
        // the edit view has its own loader, but we can make the modal open
        // instantaneously by preloading the fetch result
        apiQueryClient.setQueryData(
          'projectView',
          { path: { project: project.name } },
          project
        )
        navigate(pb.projectEdit({ project: project.name }))
      },
    },
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () => deleteProject.mutateAsync({ path: { project: project.name } }),
        label: project.name,
      }),
    },
  ]

  useQuickActions(
    useMemo(
      () => [
        {
          value: 'New project',
          onSelect: () => navigate(pb.projectNew()),
        },
        ...(projects?.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(pb.instances({ project: p.name })),
          navGroup: 'Go to project',
        })),
      ],
      [navigate, projects]
    )
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon />}>Projects</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.projectNew()} className={buttonStyle({ size: 'sm' })}>
          New Project
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((project) => pb.instances({ project }))} />
        <Column accessor="description" />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
