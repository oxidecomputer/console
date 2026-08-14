/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import {
  api,
  MAX_BUNDLE_COMMENT_BYTES,
  queryClient,
  useApiMutation,
  utf8ByteLength,
} from '@oxide/api'

import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { pb } from '~/util/path-builder'

const defaultValues = { userComment: '' }

export const handle = titleCrumb('New support bundle')

export default function CreateSupportBundleSideModalForm() {
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.supportBundles())

  const createBundle = useApiMutation(api.supportBundleCreate, {
    onSuccess() {
      queryClient.invalidateEndpoint('supportBundleList')
      addToast('Support bundle created')
      navigate(pb.supportBundles())
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="support bundle"
      onDismiss={onDismiss}
      onSubmit={({ userComment }) => {
        createBundle.mutate({ body: { userComment: userComment || null } })
      }}
      loading={createBundle.isPending}
      submitError={createBundle.error}
    >
      <Message
        variant="info"
        content="Bundle collection runs in the background and can take several minutes. The bundle can be downloaded once collection is complete."
      />
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
    </SideModalForm>
  )
}
