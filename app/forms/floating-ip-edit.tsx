/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery, type FloatingIp } from '@oxide/api'
import { Networking16Icon, ResourceLabel } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { getFloatingIpSelector, useFloatingIpSelector, useForm } from 'app/hooks'
import { pb } from 'app/util/path-builder'

// ROUGH EDGE: Trying to get this working, in sidebar
// This is copied off of the Image edit form, but it's not working yet

EditFloatingIpSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, floatingIp } = getFloatingIpSelector(params)
  await apiQueryClient.prefetchQuery('floatingIpView', {
    path: { floatingIp },
    query: { project },
  })
  return null
}

export function EditFloatingIpSideModalForm() {
  const { project, floatingIp } = useFloatingIpSelector()
  const { data } = usePrefetchedApiQuery('floatingIpView', {
    path: { floatingIp },
    query: { project },
  })

  const dismissLink = pb.floatingIps({ project })
  return <EditImageSideModalForm floatingIp={data} dismissLink={dismissLink} />
}

EditSiloImageSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { floatingIp } = getFloatingIpSelector(params)
  await apiQueryClient.prefetchQuery('floatingIpView', { path: { floatingIp } })
  return null
}

export function EditSiloImageSideModalForm() {
  const { floatingIp } = useFloatingIpSelector()
  const { data } = usePrefetchedApiQuery('floatingIpView', { path: { floatingIp } })

  return <EditImageSideModalForm floatingIp={data} dismissLink={pb.siloImages()} />
}

export function EditImageSideModalForm({
  floatingIp,
  dismissLink,
}: {
  floatingIp: FloatingIp
  dismissLink: string
}) {
  const navigate = useNavigate()
  const form = useForm({ defaultValues: floatingIp })

  return (
    <SideModalForm
      id="edit-floating-ip-form"
      form={form}
      title="Floating IP"
      onDismiss={() => navigate(dismissLink)}
      subtitle={
        <ResourceLabel>
          <Networking16Icon /> {floatingIp.name}
        </ResourceLabel>
      }
      // TODO: pass actual error when this form is hooked up
      submitError={null}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} required />
    </SideModalForm>
  )
}
