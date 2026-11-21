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
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

import { projectPolicyView, siloPolicyView } from './access-data'

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
