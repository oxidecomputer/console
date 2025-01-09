/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router'

import { apiq, getListQFn, queryClient, useApiMutation, type Project } from '@oxide/api'
import { Folder16Icon, Folder24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'








import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Folder24Icon />}
    title="No projects"
    body="Create a project to start working with instances, disks, and more"
    buttonText="New project"
    buttonTo={pb.projectsNew()}
  />
)

const projectList = getListQFn('projectList', {})

export async function loader() {
  await queryClient.prefetchQuery(projectList.optionsFn())
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

Component.displayName = 'ProjectsPage'
export function Component() {
  const navigate = useNavigate()

  const { mutateAsync: deleteProject } = useApiMutation('projectDelete', {
    onSuccess() {
      queryClient.invalidateEndpoint('projectList')
    },
  })

  const makeActions = useCallback(
    (project: Project): MenuAction[] => [
      {
        label: 'Edit',
        onActivate: () => {
          // the edit view has its own loader, but we can make the modal open
          // instantaneously by preloading the fetch result
          const { queryKey } = apiq('projectView', { path: { project: project.name } })
          queryClient.setQueryData(queryKey, project)
          navigate(pb.projectEdit({ project: project.name }))
        },
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteProject({ path: { project: project.name } }),
          label: project.name,
        }),
      },
    ],
    [deleteProject, navigate]
  )

  const columns = useColsWithActions(staticCols, makeActions)
  const {
    table,
    query: { data: projects },
  } = useQueryTable({ query: projectList, columns, emptyState: <EmptyState /> })

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

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon />}>Projects</PageTitle>
        <DocsPopover
          heading="projects"
          icon={<Folder16Icon />}
          summary="Projects are containers for managing resources like instances, disks, and VPCs."
          links={[docLinks.keyConceptsProjects, docLinks.projects]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.projectsNew()}>New Project</CreateLink>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
