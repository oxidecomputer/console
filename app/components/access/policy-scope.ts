/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback, type ComponentType } from 'react'

import {
  api,
  deleteRole,
  groupMemberList,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type AccessScope,
  type Policy,
} from '@oxide/api'

import { type EditRoleModalProps } from '~/forms/access-util'
import { ProjectAccessEditRoleModal } from '~/forms/project-access'
import { invalidateSiloPolicy, SiloAccessEditRoleModal } from '~/forms/silo-access'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

// The API only sorts users and groups by id, so fetch the full sets and sort by
// name client-side. ALL_ISH is the practical ceiling; a silo with more than
// that would have its tail dropped in (arbitrary) id order.
export const userListAll = q(api.userList, { query: { limit: ALL_ISH } })
export const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })
export const siloPolicyView = q(api.policyView, {})
export const projectPolicyView = ({ project }: PP.Project) =>
  q(api.projectPolicyView, { path: { project } })

/**
 * Prefetch everything the Users and Groups tabs (and their detail modals) need,
 * so switching tabs doesn't trigger a fetch. Per-group member lists are fired
 * but not awaited: readers use `useQuery`/`useQueries`, so member counts and
 * per-user group lists fill in as they resolve instead of blocking the page on
 * one request per group.
 */
export async function prefetchUsersAndGroups(project?: string) {
  await Promise.all([
    queryClient.fetchQuery(groupListAll).then((groups) => {
      groups.items.forEach((g) =>
        queryClient.prefetchQuery(groupMemberList({ groupId: g.id }))
      )
    }),
    queryClient.prefetchQuery(siloPolicyView),
    queryClient.prefetchQuery(userListAll),
    project && queryClient.prefetchQuery(projectPolicyView({ project })),
  ])
}

/**
 * The policy an Access page manages, plus what the shared tabs need to
 * act on it. Silo roles contribute to effective roles on both silo and project
 * pages; only the managed scope's direct roles can be edited.
 */
export type PolicyScope = {
  managedScope: AccessScope
  siloPolicy: Policy
  /** Present on project pages only */
  projectPolicy?: Policy
  managedPolicy: Policy
  EditModal: ComponentType<EditRoleModalProps>
  /** Remove any direct role for the identity in the managed policy */
  removeRole: (identityId: string) => Promise<unknown>
  userPath: (userId: string) => string
  groupPath: (groupId: string) => string
  /** Docs on the managed scope's roles */
  rolesDocLink: { href: string; linkText: string }
}

const siloUserPath = (userId: string) => pb.siloUser({ userId })
const siloGroupPath = (groupId: string) => pb.siloGroup({ groupId })

export function useSiloPolicyScope(): PolicyScope {
  const { data: siloPolicy } = usePrefetchedQuery(siloPolicyView)
  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      invalidateSiloPolicy()
      addToast({ content: 'Role removed' })
    },
  })
  const removeRole = useCallback(
    (identityId: string) => updatePolicy({ body: deleteRole(identityId, siloPolicy) }),
    [updatePolicy, siloPolicy]
  )
  return {
    managedScope: 'silo',
    siloPolicy,
    managedPolicy: siloPolicy,
    EditModal: SiloAccessEditRoleModal,
    removeRole,
    userPath: siloUserPath,
    groupPath: siloGroupPath,
    rolesDocLink: docLinks.siloRoles,
  }
}

export function useProjectPolicyScope(): PolicyScope {
  const { project } = useProjectSelector()
  const { data: siloPolicy } = usePrefetchedQuery(siloPolicyView)
  const { data: projectPolicy } = usePrefetchedQuery(projectPolicyView({ project }))
  const { mutateAsync: updatePolicy } = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
      addToast({ content: 'Role removed' })
    },
  })
  const removeRole = useCallback(
    (identityId: string) =>
      updatePolicy({ path: { project }, body: deleteRole(identityId, projectPolicy) }),
    [updatePolicy, project, projectPolicy]
  )
  const userPath = useCallback(
    (userId: string) => pb.projectUser({ project, userId }),
    [project]
  )
  const groupPath = useCallback(
    (groupId: string) => pb.projectGroup({ project, groupId }),
    [project]
  )
  return {
    managedScope: 'project',
    siloPolicy,
    projectPolicy,
    managedPolicy: projectPolicy,
    EditModal: ProjectAccessEditRoleModal,
    removeRole,
    userPath,
    groupPath,
    rolesDocLink: docLinks.projectRoles,
  }
}
