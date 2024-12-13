/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import { Gateway16Icon } from '@oxide/design-system/icons/react'

import { apiQueryClient, queryClient, usePrefetchedApiQuery } from '~/api'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { IpPoolCell } from '~/table/cells/IpPoolCell'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { FormDivider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel, SideModal } from '~/ui/lib/SideModal'
import { Table } from '~/ui/lib/Table'
import { links } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import {
  gatewayIpAddressList,
  gatewayIpPoolList,
  routeList,
  routerList,
  useGatewayRoutes,
} from './gateway-data'

const RoutesEmpty = () => (
  <Table.Row>
    <Table.Cell colSpan={2} className="!bg-raise">
      No VPC router routes target this gateway.
    </Table.Cell>
  </Table.Row>
)

function RouteRows({ project, vpc, gateway }: PP.VpcInternetGateway) {
  const matchingRoutes = useGatewayRoutes({ project, vpc, gateway })

  if (!matchingRoutes) return null
  if (matchingRoutes.length === 0) return <RoutesEmpty />

  return matchingRoutes.map(([router, route]) => (
    <Table.Row key={route.id}>
      <Table.Cell className="!bg-raise">{router}</Table.Cell>
      <Table.Cell className="bg-raise">
        <Link
          to={pb.vpcRouterRouteEdit({ project, vpc, router, route: route.name })}
          className="link-with-underline text-sans-md"
        >
          {route.name}
        </Link>
      </Table.Cell>
    </Table.Row>
  ))
}

EditInternetGatewayForm.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, gateway } = getInternetGatewaySelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('internetGatewayView', {
      query: { project, vpc },
      path: { gateway },
    }),
    queryClient.prefetchQuery(gatewayIpPoolList({ project, vpc, gateway }).optionsFn()),
    queryClient.prefetchQuery(gatewayIpAddressList({ project, vpc, gateway }).optionsFn()),
    ...(await queryClient.fetchQuery(routerList({ project, vpc }).optionsFn())).items.map(
      (router) =>
        queryClient.prefetchQuery(
          routeList({ project, vpc, router: router.name }).optionsFn()
        )
    ),
  ] satisfies Promise<unknown>[])
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

  const hasAttachedPool = gatewayIpPools && gatewayIpPools.length > 0

  return (
    <SideModalForm
      title="Internet gateway"
      formType="edit"
      resourceName="internet gateway"
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
      <Message
        variant="info"
        content={
          <>
            For now, gateways can only be modified through the API. Learn more in the{' '}
            <a
              href={links.gatewaysDocs}
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Networking
            </a>{' '}
            guide.
          </>
        }
      />
      <PropertiesTable key={internetGateway.id}>
        <PropertiesTable.Row label="Name">{internetGateway.name}</PropertiesTable.Row>
        <PropertiesTable.Row label="Description">
          <DescriptionCell text={internetGateway.description} />
        </PropertiesTable.Row>
      </PropertiesTable>

      <FormDivider />
      <div className="flex flex-col gap-3">
        <SideModal.Heading>
          Internet gateway IP address
          {gatewayIpAddresses && gatewayIpAddresses.length > 1 ? 'es' : ''}
        </SideModal.Heading>
        {gatewayIpAddresses && gatewayIpAddresses.length > 0 ? (
          gatewayIpAddresses.map((gatewayIpAddress) => (
            <PropertiesTable key={gatewayIpAddress.id}>
              <PropertiesTable.Row label="Name">
                {gatewayIpAddress.name}
              </PropertiesTable.Row>
              <PropertiesTable.Row label="Description">
                <DescriptionCell text={gatewayIpAddress.description} />
              </PropertiesTable.Row>
              <PropertiesTable.Row label="IP Address">
                <CopyableIp ip={gatewayIpAddress.address} />
              </PropertiesTable.Row>
            </PropertiesTable>
          ))
        ) : (
          <div className="mt-2">
            {'This internet gateway does not have any IP addresses attached. '}
            {hasAttachedPool
              ? 'It will use an address from the attached IP pool.'
              : 'Use the CLI to attach an IP pool or IP address to this gateway.'}
          </div>
        )}
      </div>

      <FormDivider />

      <div className="flex flex-col gap-3">
        <SideModal.Heading>
          Internet gateway IP pool
          {gatewayIpPools && gatewayIpPools.length > 1 ? 's' : ''}
        </SideModal.Heading>
        {hasAttachedPool ? (
          gatewayIpPools.map((gatewayIpPool) => (
            <PropertiesTable key={gatewayIpPool.id}>
              <PropertiesTable.Row label="Name">{gatewayIpPool.name}</PropertiesTable.Row>
              <PropertiesTable.Row label="Description">
                <DescriptionCell text={gatewayIpPool.description} />
              </PropertiesTable.Row>
              <PropertiesTable.Row label="IP Pool Name">
                <IpPoolCell ipPoolId={gatewayIpPool.ipPoolId} />
              </PropertiesTable.Row>
            </PropertiesTable>
          ))
        ) : (
          <div className="mt-2">
            This internet gateway does not have any IP pools attached.
          </div>
        )}
      </div>

      <FormDivider />

      <div className="flex flex-col gap-3">
        <SideModal.Heading>
          Routes targeting this gateway
          {gatewayIpPools && gatewayIpPools.length > 1 ? 's' : ''}
        </SideModal.Heading>
        <Table>
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeadCell>Router</Table.HeadCell>
              <Table.HeadCell>Route</Table.HeadCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            <RouteRows project={project} vpc={vpc} gateway={gateway} />
          </Table.Body>
        </Table>
      </div>
    </SideModalForm>
  )
}
