import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Button, PropertiesTable, SideModal, Truncate } from '@oxide/ui'

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
  const { silo, provider } = useIdpSelector()
  const { data: idp } = useApiQuery('samlIdentityProviderView', {
    path: { provider },
    query: { silo },
  })
  invariant(idp, 'IdP was not prefetched in loader')

  const navigate = useNavigate()
  const closeModal = () => navigate(pb.silo({ silo }))

  return (
    <SideModal
      onDismiss={closeModal}
      isOpen
      title="Identity provider"
      animate={useShouldAnimateModal()}
    >
      <SideModal.Body>
        <PropertiesTable>
          <PropertiesTable.Row label="ID">
            <Truncate text={idp.id} maxLength={28} hasCopyButton />
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Name">{idp.name}</PropertiesTable.Row>
          <PropertiesTable.Row label="Description">
            <Truncate text={idp.description} maxLength={36} />
          </PropertiesTable.Row>
          <PropertiesTable.Row label="ACS URL">{idp.acsUrl}</PropertiesTable.Row>
          <PropertiesTable.Row label="Entity ID">{idp.idpEntityId}</PropertiesTable.Row>
          <PropertiesTable.Row label="SLO URL">{idp.sloUrl}</PropertiesTable.Row>
          <PropertiesTable.Row label="Contact email">
            {idp.technicalContactEmail}
          </PropertiesTable.Row>
          {/* TODO: add group attribute name when it is added to the API */}
        </PropertiesTable>
      </SideModal.Body>
      <SideModal.Footer className="justify-end">
        <Button size="sm" onClick={closeModal}>
          Done
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
