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
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
} from '@oxide/api'

import { certDefaultValues, CertFields } from '~/components/form/fields/TlsCertsField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useSiloSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

export const handle = titleCrumb('Add Certificate')

export default function SiloCertificateCreateForm() {
  const navigate = useNavigate()
  const siloSelector = useSiloSelector()
  const { silo } = siloSelector

  // both prefetched by parent route loaders (SiloPage, SiloCertificatesTab)
  const { data: siloData } = usePrefetchedQuery(q(api.siloView, { path: siloSelector }))
  const { data: allCerts } = usePrefetchedQuery(
    getListQFn(api.siloCertificateList, { query: { silo, limit: ALL_ISH } }).optionsFn()
  )

  const onDismiss = () => navigate(pb.siloCertificates({ silo }))

  const createCert = useApiMutation(api.siloCertificateCreate, {
    onSuccess(cert) {
      queryClient.invalidateEndpoint('siloCertificateList')
      // prettier-ignore
      addToast(<>Certificate <HL>{cert.name}</HL> added</>)
      onDismiss()
    },
  })

  const form = useForm({ defaultValues: certDefaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="certificate"
      title="Add TLS certificate"
      submitLabel="Add certificate"
      onDismiss={onDismiss}
      onSubmit={async ({ cert, key, ...rest }) => {
        // required fields, always present if form validation passed
        if (!cert || !key) return
        createCert.mutate({
          query: { silo },
          body: { ...rest, cert: await cert.text(), key: await key.text() },
        })
      }}
      loading={createCert.isPending || createCert.isSuccess}
      submitError={createCert.error}
    >
      <CertFields
        control={form.control}
        allNames={allCerts.items.map((c) => c.name)}
        siloName={siloData.name}
      />
    </SideModalForm>
  )
}
