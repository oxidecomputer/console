/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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

import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getSupportBundleSelector, useSupportBundleSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const bundleView = ({ bundleId }: PP.SupportBundle) =>
  q(api.supportBundleView, { path: { bundleId } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getSupportBundleSelector(params)
  await queryClient.prefetchQuery(bundleView(selector))
  return null
}

export const handle = titleCrumb('Edit support bundle')

export default function EditSupportBundleSideModalForm() {
  const navigate = useNavigate()
  const selector = useSupportBundleSelector()

  const { data: bundle } = usePrefetchedQuery(bundleView(selector))

  const form = useForm({ defaultValues: { userComment: bundle.userComment || '' } })

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
      resourceName="support bundle"
      onDismiss={onDismiss}
      onSubmit={({ userComment }) => {
        editBundle.mutate({
          path: { bundleId: selector.bundleId },
          body: { userComment: userComment || null },
        })
      }}
      loading={editBundle.isPending}
      submitError={editBundle.error}
    >
      <TextField
        as="textarea"
        name="userComment"
        label="Comment"
        description="Note about why this bundle is being collected"
        rows={4}
        control={form.control}
        validate={(value) =>
          utf8ByteLength(value) > MAX_BUNDLE_COMMENT_BYTES
            ? `Comment cannot exceed ${MAX_BUNDLE_COMMENT_BYTES} bytes`
            : true
        }
      />
    </SideModalForm>
  )
}
