/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { match } from 'ts-pattern'

import { api, q } from '@oxide/api'

import { useProjectSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import { EmptyCell, SkeletonCell } from './EmptyCell'
import { LinkCell } from './LinkCell'

type InstanceLinkProps = {
  instanceId?: string | null
  tab: 'storage' | 'networking'
}

type InstanceLinkResult =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'success'; to: string; name: string }

function useInstanceLink({ instanceId, tab }: InstanceLinkProps): InstanceLinkResult {
  const { project } = useProjectSelector()
  const { data: instance } = useQuery(
    q(api.instanceView, { path: { instance: instanceId! } }, { enabled: !!instanceId })
  )

  if (!instanceId) return { status: 'empty' }
  if (!instance) return { status: 'loading' }

  const params = { project, instance: instance.name }
  const to =
    tab === 'networking' ? pb.instanceNetworking(params) : pb.instanceStorage(params)

  return { status: 'success', to, name: instance.name }
}

/** Plain link for use outside tables (e.g., PropertiesTable in side modals). */
export const InstanceLink = (props: InstanceLinkProps) =>
  match(useInstanceLink(props))
    .with({ status: 'empty' }, () => <EmptyCell />)
    .with({ status: 'loading' }, () => <SkeletonCell />)
    .with({ status: 'success' }, ({ to, name }) => (
      <Link to={to} className="link-with-underline text-sans-md">
        {name}
      </Link>
    ))
    .exhaustive()

/** Table cell with hover highlight. Use in column definitions. */
export const InstanceLinkCell = (props: InstanceLinkProps) =>
  match(useInstanceLink(props))
    .with({ status: 'empty' }, () => <EmptyCell />)
    .with({ status: 'loading' }, () => <SkeletonCell />)
    .with({ status: 'success' }, ({ to, name }) => <LinkCell to={to}>{name}</LinkCell>)
    .exhaustive()
