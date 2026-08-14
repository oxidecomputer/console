/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  api,
  MAX_BUNDLE_COMMENT_BYTES,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  utf8ByteLength,
} from '@oxide/api'
import { Logs16Icon } from '@oxide/design-system/icons/react'

import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { SupportBundleStateBadge } from '~/components/StateBadge'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getSupportBundleSelector, useSupportBundleSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { Button } from '~/ui/lib/Button'
import { FormDivider } from '~/ui/lib/Divider'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { Spinner } from '~/ui/lib/Spinner'
import { truncate } from '~/ui/lib/Truncate'
import { Size } from '~/ui/lib/ValueUnit'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'
import {
  bundleDownloadUrl,
  bundleIndexQuery,
  bundleSizeQuery,
  triggerDownload,
} from '~/util/support-bundle'

const bundleView = ({ bundleId }: PP.SupportBundle) =>
  q(api.supportBundleView, { path: { bundleId } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  await queryClient.prefetchQuery(bundleView(getSupportBundleSelector(params)))
  return null
}

export const handle = titleCrumb('Support bundle')

/** Spinner while the query is in flight, em dash if it failed */
function AsyncValue<T>({
  query,
  children,
}: {
  query: UseQueryResult<T>
  children: (data: T) => ReactNode
}) {
  if (query.isPending) return <Spinner />
  if (query.isError) return <EmptyCell />
  return <>{children(query.data)}</>
}

export default function SupportBundleDetail() {
  const navigate = useNavigate()
  const { bundleId } = useSupportBundleSelector()
  const { data: bundle } = usePrefetchedQuery(bundleView({ bundleId }))

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
              <DescriptionCell text={bundle.reasonForFailure} sideModal />
            </PropertiesTable.Row>
          )}
          <PropertiesTable.Row label="Reason">
            <DescriptionCell text={bundle.reasonForCreation} sideModal />
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
          disabledReason="Only bundles that have completed collection can be downloaded"
          onClick={() =>
            triggerDownload(bundleDownloadUrl(bundle.id), `support-bundle-${bundle.id}.zip`)
          }
        >
          Download bundle
        </Button>
      </div>
      <FormDivider />
      <TextField
        as="textarea"
        name="userComment"
        label="Comment"
        rows={4}
        control={form.control}
        validate={(value) =>
          utf8ByteLength(value) > MAX_BUNDLE_COMMENT_BYTES
            ? `Comment cannot exceed ${MAX_BUNDLE_COMMENT_BYTES} bytes`
            : true
        }
      />
      <SideModalFormDocs docs={[docLinks.supportBundles]} />
    </SideModalForm>
  )
}
