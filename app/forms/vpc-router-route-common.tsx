/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { UseFormReturn } from 'react-hook-form'

import {
  usePrefetchedApiQuery,
  type RouteDestination,
  type RouterRouteCreate,
  type RouterRouteUpdate,
  type RouteTarget,
} from '~/api'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { useVpcRouterSelector } from '~/hooks/use-params'
import { Message } from '~/ui/lib/Message'

export type RouteFormValues = RouterRouteCreate | Required<RouterRouteUpdate>

export const routeFormMessage = {
  vpcSubnetNotModifiable:
    'Routes of type VPC Subnet within the system router are not modifiable',
  internetGatewayTargetValue:
    'For ‘Internet gateway’ targets, the value must be ‘outbound’',
  // https://github.com/oxidecomputer/omicron/blob/914f5fd7d51f9b060dcc0382a30b607e25df49b2/nexus/src/app/vpc_router.rs#L201-L204
  noNewRoutesOnSystemRouter: 'User-provided routes cannot be added to a system router',
  // https://github.com/oxidecomputer/omicron/blob/914f5fd7d51f9b060dcc0382a30b607e25df49b2/nexus/src/app/vpc_router.rs#L300-L304
  noDeletingRoutesOnSystemRouter: 'System routes cannot be deleted',
  // https://github.com/oxidecomputer/omicron/blob/914f5fd7d51f9b060dcc0382a30b607e25df49b2/nexus/src/app/vpc_router.rs#L136-L138
  noDeletingSystemRouters: 'System routers cannot be deleted',
}

// VPCs cannot be specified as a destination in custom routers
// https://github.com/oxidecomputer/omicron/blob/4f27433d1bca57eb02073a4ea1cd14557f70b8c7/nexus/src/app/vpc_router.rs#L363
const destTypes: Record<Exclude<RouteDestination['type'], 'vpc'>, string> = {
  ip: 'IP',
  ip_net: 'IP network',
  subnet: 'Subnet',
}

// Subnets and VPCs cannot be used as a target in custom routers
// https://github.com/oxidecomputer/omicron/blob/4f27433d1bca57eb02073a4ea1cd14557f70b8c7/nexus/src/app/vpc_router.rs#L362-L368
const targetTypes: Record<Exclude<RouteTarget['type'], 'subnet' | 'vpc'>, string> = {
  ip: 'IP',
  instance: 'Instance',
  internet_gateway: 'Internet gateway',
  drop: 'Drop',
}

const getDestinationValuePlaceholder = (destinationType: RouteDestination['type']) =>
  ({
    ip: 'Enter an IP',
    ip_net: 'Enter an IP network',
    subnet: 'Select a subnet',
    vpc: undefined,
  })[destinationType]

const getDestinationValueDescription = (destinationType: RouteDestination['type']) =>
  ({
    ip: 'An IP address, like 192.168.1.222',
    ip_net: 'An IP subnet, like 192.168.0.0/16',
    subnet: undefined,
    vpc: undefined,
  })[destinationType]

const getTargetValuePlaceholder = (destinationType: RouteTarget['type']) =>
  ({
    ip: 'Enter an IP',
    instance: 'Select an instance',
    internet_gateway: undefined,
    drop: undefined,
    subnet: undefined,
    vpc: undefined,
  })[destinationType]

const getTargetValueDescription = (targetType: RouteTarget['type']) =>
  ({
    ip: 'An IP address, like 10.0.1.5',
    instance: undefined,
    internet_gateway: routeFormMessage.internetGatewayTargetValue,
    drop: undefined,
    subnet: undefined,
    vpc: undefined,
  })[targetType]

const toItems = (mapping: Record<string, string>) =>
  Object.entries(mapping).map(([value, label]) => ({ value, label }))

type RouteFormFieldsProps = {
  form: UseFormReturn<RouteFormValues>
  isDisabled?: boolean
}
export const RouteFormFields = ({ form, isDisabled }: RouteFormFieldsProps) => {
  const routerSelector = useVpcRouterSelector()
  const { project, vpc } = routerSelector
  // usePrefetchedApiQuery items below are initially fetched in the loaders in vpc-router-route-create and -edit
  const {
    data: { items: vpcSubnets },
  } = usePrefetchedApiQuery('vpcSubnetList', { query: { project, vpc, limit: 1000 } })
  const {
    data: { items: instances },
  } = usePrefetchedApiQuery('instanceList', { query: { project, limit: 1000 } })

  const { control } = form
  const destinationType = form.watch('destination.type')
  const targetType = form.watch('target.type')
  const destinationValueProps = {
    name: 'destination.value' as const,
    label: 'Destination value',
    control,
    placeholder: getDestinationValuePlaceholder(destinationType),
    required: true,
    disabled: isDisabled,
    description: getDestinationValueDescription(destinationType),
  }
  const targetValueProps = {
    name: 'target.value' as const,
    label: 'Target value',
    control,
    // possible targetTypes needing placeholders are instances or IPs (internet_gateway has no placeholder)
    placeholder: getTargetValuePlaceholder(targetType),
    required: true,
    // 'internet_gateway' targetTypes can only have the value 'outbound', so we disable the field
    disabled: isDisabled || targetType === 'internet_gateway',
    description: getTargetValueDescription(targetType),
  }
  return (
    <>
      {isDisabled && (
        <Message variant="info" content={routeFormMessage.vpcSubnetNotModifiable} />
      )}
      <NameField name="name" control={control} disabled={isDisabled} />
      <DescriptionField name="description" control={control} disabled={isDisabled} />
      <ListboxField
        name="destination.type"
        label="Destination type"
        control={control}
        items={toItems(destTypes)}
        placeholder="Select a destination type"
        required
        onChange={() => {
          form.setValue('destination.value', '')
        }}
        disabled={isDisabled}
      />
      {destinationType === 'subnet' ? (
        <ComboboxField
          {...destinationValueProps}
          items={vpcSubnets.map(({ name }) => ({ value: name, label: name }))}
          isDisabled={isDisabled}
        />
      ) : (
        <TextField {...destinationValueProps} />
      )}
      <ListboxField
        name="target.type"
        label="Target type"
        control={control}
        items={toItems(targetTypes)}
        placeholder="Select a target type"
        required
        onChange={(value) => {
          form.setValue('target.value', value === 'internet_gateway' ? 'outbound' : '')
        }}
        disabled={isDisabled}
      />
      {targetType === 'drop' ? null : targetType === 'instance' ? (
        <ComboboxField
          {...targetValueProps}
          items={instances.map(({ name }) => ({ value: name, label: name }))}
          isDisabled={isDisabled}
        />
      ) : (
        <TextField {...targetValueProps} />
      )}
    </>
  )
}
