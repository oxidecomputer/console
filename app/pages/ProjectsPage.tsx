/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Project,
} from '@oxide/api'
import { Folder16Icon, Folder24Icon } from '@oxide/design-system/icons/react'

import { ContextualDocsModal } from '~/components/ContextualDocsModal'
import { confirmDelete } from '~/stores/confirm-delete'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

import { useQuickActions } from '../hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No projects"
    body="You need to create a project to be able to see it here"
    buttonText="New project"
    buttonTo={pb.projectsNew()}
  />
)

ProjectsPage.loader = async () => {
  await apiQueryClient.prefetchQuery('projectList', { query: { limit: PAGE_SIZE } })
  return null
}

const colHelper = createColumnHelper<Project>()
const staticCols = [
  colHelper.accessor('name', {
    cell: makeLinkCell((project) => pb.project({ project })),
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export function ProjectsPage() {
  const navigate = useNavigate()

  const queryClient = useApiQueryClient()
  const { Table } = useQueryTable('projectList', {})
  const { data: projects } = usePrefetchedApiQuery('projectList', {
    query: { limit: PAGE_SIZE },
  })

  const deleteProject = useApiMutation('projectDelete', {
    onSuccess() {
      // TODO: figure out if this is invalidating as expected, can we leave out the query
      // altogether, etc. Look at whether limit param matters.
      queryClient.invalidateQueries('projectList')
    },
  })

  const makeActions = useCallback(
    (project: Project): MenuAction[] => [
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
    ],
    [deleteProject, navigate]
  )

  useQuickActions(
    useMemo(
      () => [
        {
          value: 'New project',
          onSelect: () => navigate(pb.projectsNew()),
        },
        ...(projects?.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(pb.project({ project: p.name })),
          navGroup: 'Go to project',
        })),
      ],
      [navigate, projects]
    )
  )

  const columns = useColsWithActions(staticCols, makeActions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon />}>Projects</PageTitle>
        <ContextualDocsModal
          heading="Projects"
          icon={<Folder16Icon />}
          summary="Projects are logical containers for managing compute, storage and network resources within a silo."
          links={[docLinks.keyConceptsProjects, docLinks.projects]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.projectsNew()}>New Project</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
      <Outlet />
    </>
  )
}
