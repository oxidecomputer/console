/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  api,
  q,
  queryClient,
  supportBundleTransitioning,
  useApiMutation,
  usePrefetchedQuery,
} from '@oxide/api'
import { Issues16Icon } from '@oxide/design-system/icons/react'

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
  downloadBundle,
  downloadDisabledReason,
  POLL_INTERVAL,
} from '~/util/support-bundle'

const bundleView = ({ bundleId }: PP.SupportBundle) =>
  q(
    api.supportBundleView,
    { path: { bundleId } },
    {
      // keep transitional states moving while the modal is open, matching the
      // list's polling, so a collecting bundle flips to active in place
      refetchInterval: ({ state: { data } }) =>
        data && supportBundleTransitioning(data.state) ? POLL_INTERVAL : false,
    }
  )

export async function clientLoader({ params }: LoaderFunctionArgs) {
  await queryClient.prefetchQuery(bundleView(getSupportBundleSelector(params)))
  return null
}

export const handle = titleCrumb('Support bundle')

/**
 * Total bundle size from `Content-Length` on a HEAD of the download endpoint.
 * Calls the generated client directly rather than through `q`, which unwraps
 * the result to `data` and drops the response headers.
 */
function BundleSize({ bundleId }: { bundleId: string }) {
  const { data: size, isPending } = useQuery({
    queryKey: ['supportBundleSize', bundleId],
    queryFn: async () => {
      const result = await api.supportBundleHead({ path: { bundleId } })
      if (result.type !== 'success') {
        throw new Error(`Error fetching bundle size (${result.response.status})`)
      }
      // handle missing/malformed headers, rather than showing `0 B`
      const size = Number(result.response.headers.get('content-length'))
      if (!size) throw new Error('Bundle size missing from response')
      return size
    },
    // bundle contents never change once collection is complete
    staleTime: Infinity,
  })
  if (isPending) return <SkeletonCell />
  if (!size) return <EmptyCell />
  return <Size bytes={size} />
}

export default function SupportBundleDetail() {
  const navigate = useNavigate()
  const { bundleId } = useSupportBundleSelector()
  const { data: bundle } = usePrefetchedQuery(bundleView({ bundleId }))

  const downloadDisabled = downloadDisabledReason(bundle.state)

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
          <Issues16Icon /> {truncate(bundle.id, 14, 'middle')}
        </ResourceLabel>
      }
      onDismiss={onDismiss}
      onSubmit={({ userComment }) => {
        editBundle.mutate({
          path: { bundleId },
          body: { userComment: userComment || null },
        })
      }}
      loading={editBundle.isPending || editBundle.isSuccess}
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
          {bundle.state === 'active' && (
            <PropertiesTable.Row label="Size">
              <BundleSize bundleId={bundleId} />
            </PropertiesTable.Row>
          )}
        </PropertiesTable>
        <Button
          className="w-full"
          size="sm"
          disabled={!!downloadDisabled}
          disabledReason={downloadDisabled}
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
