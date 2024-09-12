/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { UseFormReturn } from 'react-hook-form'

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

type RouteFormFieldsProps = {
  form: UseFormReturn<RouteFormValues>
  isDisabled?: boolean
}
export const RouteFormFields = ({ form, isDisabled }: RouteFormFieldsProps) => {
  const { control } = form
  const targetType = form.watch('target.type')
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
        disabled={isDisabled}
      />
      <TextField
        name="destination.value"
        label="Destination value"
        control={control}
        placeholder="Enter a destination value"
        required
        disabled={isDisabled}
      />
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
      {targetType !== 'drop' && (
        <TextField
          name="target.value"
          label="Target value"
          control={control}
          placeholder="Enter a target value"
          required
          // 'internet_gateway' targetTypes can only have the value 'outbound', so we disable the field
          disabled={isDisabled || targetType === 'internet_gateway'}
          description={
            targetType === 'internet_gateway' && routeFormMessage.internetGatewayTargetValue
          }
        />
      )}
    </>
  )
}
