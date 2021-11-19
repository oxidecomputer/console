import React from 'react'
import { Folder24Icon, PageHeader, PageTitle, PropertiesTable } from '@oxide/ui'

const VpcPage = () => {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon title="Vpcs" />}>vpc-abc123</PageTitle>
      </PageHeader>
      <section className="grid">
        <div className="flex space-x-3">
          <PropertiesTable.Group>
            <PropertiesTable>
              <PropertiesTable.Row label="Description">
                Default network for the project
              </PropertiesTable.Row>
              <PropertiesTable.Row label="DNS Name">
                frontend-production-vpc
              </PropertiesTable.Row>
            </PropertiesTable>
            <PropertiesTable>
              <PropertiesTable.Row label="Creation Date">
                Default network for the project
              </PropertiesTable.Row>
              <PropertiesTable.Row label="Last Modified">
                Default network for the project
              </PropertiesTable.Row>
            </PropertiesTable>
          </PropertiesTable.Group>
        </div>
      </section>
    </>
  )
}

export default VpcPage
