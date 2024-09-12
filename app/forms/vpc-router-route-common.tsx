/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { Control } from 'react-hook-form'

import type {
  RouteDestination,
  RouterRouteCreate,
  RouterRouteUpdate,
  RouteTarget,
} from '~/api'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { Message } from '~/ui/lib/Message'

export type RouteFormValues = RouterRouteCreate | Required<RouterRouteUpdate>

// VPCs can not be specified as a destination in custom routers
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

const toItems = (mapping: Record<string, string>) =>
  Object.entries(mapping).map(([value, label]) => ({ value, label }))

export const fields = {
  destType: {
    name: 'destination.type' as const,
    items: toItems(destTypes),
    label: 'Destination type',
    placeholder: 'Select a destination type',
    required: true,
  },
  destValue: {
    name: 'destination.value' as const,
    label: 'Destination value',
    placeholder: 'Enter a destination value',
    required: true,
  },
  targetType: {
    name: 'target.type' as const,
    items: toItems(targetTypes),
    label: 'Target type',
    placeholder: 'Select a target type',
    required: true,
  },
  targetValue: {
    name: 'target.value' as const,
    label: 'Target value',
    placeholder: 'Enter a target value',
    required: true,
  },
}

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

export const targetValueDescription = (targetType: RouteTarget['type']) =>
  targetType === 'internet_gateway'
    ? routeFormMessage.internetGatewayTargetValue
    : undefined

type RouteFormFieldsProps = {
  control: Control<RouteFormValues>
  targetType: RouteTarget['type']
  isDisabled?: boolean
}
export const RouteFormFields = ({
  control,
  targetType,
  isDisabled,
}: RouteFormFieldsProps) => {
  return (
    <>
      {isDisabled && (
        <Message variant="info" content={routeFormMessage.vpcSubnetNotModifiable} />
      )}
      <NameField name="name" control={control} disabled={isDisabled} />
      <DescriptionField name="description" control={control} disabled={isDisabled} />
      <ListboxField {...fields.destType} control={control} disabled={isDisabled} />
      <TextField {...fields.destValue} control={control} disabled={isDisabled} />
      <ListboxField {...fields.targetType} control={control} disabled={isDisabled} />
      {targetType !== 'drop' && (
        <TextField
          {...fields.targetValue}
          control={control}
          // when targetType is 'internet_gateway', we set it to `outbound` and make it non-editable
          disabled={isDisabled || targetType === 'internet_gateway'}
          description={targetValueDescription(targetType)}
        />
      )}
    </>
  )
}
