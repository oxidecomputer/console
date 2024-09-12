/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { Control } from 'react-hook-form'

import type { RouterRouteCreate, RouterRouteUpdate, RouteTarget } from '~/api'
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

type RouteFormFieldsProps = {
  control: Control<RouteFormValues>
  targetType: RouteTarget['type']
  isDisabled?: boolean
}
export const RouteFormFields = ({
  control,
  targetType,
  isDisabled,
}: RouteFormFieldsProps) => (
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
      items={[
        // VPCs can not be specified as a destination in custom routers
        // https://github.com/oxidecomputer/omicron/blob/4f27433d1bca57eb02073a4ea1cd14557f70b8c7/nexus/src/app/vpc_router.rs#L363
        { value: 'ip', label: 'IP' },
        { value: 'ip_net', label: 'IP network' },
        { value: 'subnet', label: 'Subnet' },
      ]}
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
      items={[
        // Subnets and VPCs cannot be used as a target in custom routers
        // https://github.com/oxidecomputer/omicron/blob/4f27433d1bca57eb02073a4ea1cd14557f70b8c7/nexus/src/app/vpc_router.rs#L362-L368
        { value: 'ip', label: 'IP' },
        { value: 'instance', label: 'Instance' },
        { value: 'internet_gateway', label: 'Internet gateway' },
        { value: 'drop', label: 'Drop' },
      ]}
      placeholder="Select a target type"
      required
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
