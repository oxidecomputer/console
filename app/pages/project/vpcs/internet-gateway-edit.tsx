/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import { Gateway16Icon } from '@oxide/design-system/icons/react'

import { apiQueryClient, getListQFn, queryClient, usePrefetchedApiQuery } from '~/api'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { FormDivider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel, SideModal } from '~/ui/lib/SideModal'
import { Table } from '~/ui/lib/Table'
import { Truncate } from '~/ui/lib/Truncate'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const gatewayIpPoolList = (query: PP.VpcInternetGateway) =>
  getListQFn('internetGatewayIpPoolList', { query })
const gatewayIpAddressList = (query: PP.VpcInternetGateway) =>
  getListQFn('internetGatewayIpAddressList', { query })

EditInternetGatewayForm.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, gateway } = getInternetGatewaySelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('internetGatewayView', {
      query: { project, vpc },
      path: { gateway },
    }),
    // apiQueryClient.prefetchQuery('internetGatewayIpAddressList', { query }),
    queryClient.prefetchQuery(gatewayIpPoolList({ project, vpc, gateway }).optionsFn()),
    queryClient.prefetchQuery(gatewayIpAddressList({ project, vpc, gateway }).optionsFn()),
  ])
  return null
}

export function EditInternetGatewayForm() {
  const navigate = useNavigate()
  const { project, vpc, gateway } = useInternetGatewaySelector()
  const onDismiss = () => navigate(pb.vpcInternetGateways({ project, vpc }))
  const { data: internetGateway } = usePrefetchedApiQuery('internetGatewayView', {
    query: { project, vpc },
    path: { gateway },
  })
  const { data: { items: gatewayIpPools } = {} } = useQuery(
    gatewayIpPoolList({ project, vpc, gateway }).optionsFn()
  )
  const { data: { items: gatewayIpAddresses } = {} } = useQuery(
    gatewayIpAddressList({ project, vpc, gateway }).optionsFn()
  )

  const form = useForm({})

  return (
    <SideModalForm
      title="Internet Gateway"
      formType="edit"
      resourceName="Internet Gateway"
      onDismiss={onDismiss}
      subtitle={
        <ResourceLabel>
          <Gateway16Icon /> {internetGateway.name}
        </ResourceLabel>
      }
      form={form}
      // TODO: pass actual error when this form is hooked up
      submitError={null}
      loading={false}
    >
      <PropertiesTable key={internetGateway.id}>
        <PropertiesTable.Row label="Name">{internetGateway.name}</PropertiesTable.Row>
        <PropertiesTable.Row label="Description">
          <DescriptionCell text={internetGateway.description} />
        </PropertiesTable.Row>
      </PropertiesTable>
      <Message
        variant="info"
        className="text-balance"
        content={
          <>
            This is a read-only copy of this internet gateway. Use the CLI to create and
            update internet gateways. More functionality for internet gateways will be
            included in future releases of the Oxide console.
          </>
        }
      />
      <FormDivider />
      <SideModal.Heading title="Internet Gateway">IP Addresses</SideModal.Heading>

      {gatewayIpAddresses ? (
        <Table aria-label="Port filters">
          <Table.Header>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Address</Table.HeadCell>
          </Table.Header>
          <Table.Body>
            {gatewayIpAddresses.map((gatewayIpAddress) => (
              <Table.Row key={gatewayIpAddress.id}>
                <Table.Cell className="w-1/2">
                  <Truncate text={gatewayIpAddress.name} maxLength={24} />
                </Table.Cell>
                <Table.Cell className="w-1/2">
                  <Truncate text={gatewayIpAddress.address} maxLength={24} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <EmptyCell />
      )}
      <FormDivider />

      <SideModal.Heading title="Internet Gateway">IP Pools</SideModal.Heading>

      {gatewayIpPools ? (
        <Table aria-label="Port filters">
          <Table.Header>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
          </Table.Header>
          <Table.Body>
            {gatewayIpPools.map((gatewayIpPool) => (
              <Table.Row key={gatewayIpPool.id}>
                <Table.Cell className="w-1/2">
                  <LinkCell to={pb.ipPool({ pool: gatewayIpPool.name })}>
                    <Truncate text={gatewayIpPool.name} maxLength={24} />
                  </LinkCell>
                </Table.Cell>
                <Table.Cell className="w-1/2">
                  <Truncate text={gatewayIpPool.description} maxLength={24} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <EmptyCell />
      )}

      {/* insert routes that are associated with this gateway */}
    </SideModalForm>
  )
}
