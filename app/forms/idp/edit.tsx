import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { PropertiesTable, SideModal } from '@oxide/ui'

import { useShouldAnimateModal } from 'app/components/form'
import { getIdpSelector, useIdpSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditIdpSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { silo, provider } = getIdpSelector(params)
  await apiQueryClient.prefetchQuery('samlIdentityProviderView', {
    path: { provider },
    query: { silo },
  })
  return null
}

export function EditIdpSideModalForm() {
  const navigate = useNavigate()
  const { silo, provider } = useIdpSelector()
  const { data: idp } = useApiQuery('samlIdentityProviderView', {
    path: { provider },
    query: { silo },
  })
  return (
    <SideModal
      onDismiss={() => navigate(pb.silo({ silo }))}
      isOpen
      title="IdP detail"
      animate={useShouldAnimateModal()}
    >
      <SideModal.Body>
        <PropertiesTable>
          <PropertiesTable.Row label="Name">{idp?.name}</PropertiesTable.Row>
          <PropertiesTable.Row label="Description">{idp?.description}</PropertiesTable.Row>
        </PropertiesTable>
      </SideModal.Body>
    </SideModal>
  )
}
