/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  api,
  q,
  queryClient,
  supportBundleTransitioning,
  useApiMutation,
  usePrefetchedQuery,
  type SupportBundleInfo,
} from '@oxide/api'
import { Logs16Icon } from '@oxide/design-system/icons/react'

import { BundleCommentField } from '~/components/form/fields/BundleCommentField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { SupportBundleStateBadge } from '~/components/StateBadge'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getSupportBundleSelector, useSupportBundleSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { Button } from '~/ui/lib/Button'
import { FormDivider } from '~/ui/lib/Divider'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { truncate } from '~/ui/lib/Truncate'
import { Size } from '~/ui/lib/ValueUnit'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'
import {
  bundleIndexQuery,
  bundleSizeQuery,
  downloadBundle,
  DOWNLOAD_DISABLED_REASON,
} from '~/util/support-bundle'

const SEC = 1000 // ms
const POLL_INTERVAL = 10 * SEC

const bundleView = ({ bundleId }: PP.SupportBundle) => ({
  ...q(api.supportBundleView, { path: { bundleId } }),
  // a mid-poll 404 means the bundle was deleted; handled in the component
  throwOnError: false,
  // keep transitional states moving while the modal is open, matching the
  // list's polling, so a collecting bundle flips to active in place
  refetchInterval: ({
    state: { data },
  }: {
    state: { data: SupportBundleInfo | undefined }
  }) => (data && supportBundleTransitioning(data.state) ? POLL_INTERVAL : false),
})

export async function clientLoader({ params }: LoaderFunctionArgs) {
  await queryClient.prefetchQuery(bundleView(getSupportBundleSelector(params)))
  return null
}

export const handle = titleCrumb('Support bundle')

/** Skeleton while the query is in flight, em dash if it failed */
function AsyncValue<T>({
  query,
  children,
}: {
  query: UseQueryResult<T>
  children: (data: T) => ReactNode
}) {
  if (query.isPending) return <SkeletonCell />
  if (query.isError) return <EmptyCell />
  return <>{children(query.data)}</>
}

export default function SupportBundleDetail() {
  const navigate = useNavigate()
  const { bundleId } = useSupportBundleSelector()
  const { data: bundle, error } = usePrefetchedQuery(bundleView({ bundleId }))

  // a destroying bundle's record is deleted outright when storage reclamation
  // finishes, so a 404 mid-poll means the bundle is gone for good: close the
  // modal rather than keep showing (and polling) stale data. other errors are
  // left alone — polling continues and can recover from a transient failure
  useEffect(() => {
    if (error?.statusCode === 404) {
      queryClient.invalidateEndpoint('supportBundleList')
      addToast('Support bundle no longer exists')
      navigate(pb.supportBundles())
    }
  }, [error, navigate])

  // the index and bundle zip only exist once collection has completed
  const isActive = bundle.state === 'active'
  const indexQuery = useQuery({ ...bundleIndexQuery(bundleId), enabled: isActive })
  const sizeQuery = useQuery({ ...bundleSizeQuery(bundleId), enabled: isActive })

  const form = useForm({ defaultValues: { userComment: bundle.userComment || '' } })
  // must destructure to subscribe to changes; inlining does not work
  const { isDirty } = form.formState

  const onDismiss = () => navigate(pb.supportBundles())

  const editBundle = useApiMutation(api.supportBundleUpdate, {
    onSuccess() {
      queryClient.invalidateEndpoint('supportBundleList')
      queryClient.invalidateEndpoint('supportBundleView')
      addToast('Support bundle updated')
      navigate(pb.supportBundles())
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      // scoped to the one editable field, like access forms' "Update role"
      resourceName="comment"
      title="Support bundle"
      submitDisabled={isDirty ? undefined : 'No changes to save'}
      subtitle={
        <ResourceLabel>
          <Logs16Icon /> {truncate(bundle.id, 14, 'middle')}
        </ResourceLabel>
      }
      onDismiss={onDismiss}
      onSubmit={({ userComment }) => {
        editBundle.mutate({
          path: { bundleId },
          body: { userComment: userComment || null },
        })
      }}
      loading={editBundle.isPending}
      submitError={editBundle.error}
    >
      <div className="flex flex-col gap-4">
        <PropertiesTable>
          <PropertiesTable.IdRow id={bundle.id} />
          <PropertiesTable.Row label="State">
            <SupportBundleStateBadge state={bundle.state} />
          </PropertiesTable.Row>
          {bundle.reasonForFailure && (
            <PropertiesTable.Row label="Failure reason">
              <DescriptionCell text={bundle.reasonForFailure} />
            </PropertiesTable.Row>
          )}
          <PropertiesTable.Row label="Reason">
            <DescriptionCell text={bundle.reasonForCreation} />
          </PropertiesTable.Row>
          <PropertiesTable.DateRow label="Created" date={bundle.timeCreated} />
          {isActive && (
            <PropertiesTable.Row label="Files">
              <AsyncValue query={indexQuery}>
                {(entries) =>
                  // directory entries have a trailing slash; count files only
                  entries.filter((e) => !e.endsWith('/')).length.toLocaleString()
                }
              </AsyncValue>
            </PropertiesTable.Row>
          )}
          {isActive && (
            <PropertiesTable.Row label="Size">
              <AsyncValue query={sizeQuery}>{(bytes) => <Size bytes={bytes} />}</AsyncValue>
            </PropertiesTable.Row>
          )}
        </PropertiesTable>
        <Button
          className="w-full"
          size="sm"
          disabled={!isActive}
          disabledReason={DOWNLOAD_DISABLED_REASON}
          onClick={() => downloadBundle(bundle.id)}
        >
          Download bundle
        </Button>
      </div>
      <FormDivider />
      <BundleCommentField control={form.control} />
      <SideModalFormDocs docs={[docLinks.supportBundles]} />
    </SideModalForm>
  )
}
