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
import { toComboboxItems } from '~/ui/lib/Combobox'
import { Message } from '~/ui/lib/Message'
import { validateIp, validateIpNet } from '~/util/ip'

export type RouteFormValues = RouterRouteCreate | Required<RouterRouteUpdate>

export const routeFormMessage = {
  vpcSubnetNotModifiable:
    'Routes of type VPC Subnet within the system router are not modifiable',
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

const destinationValuePlaceholder: Record<RouteDestination['type'], string | undefined> = {
  ip: 'Enter an IP',
  ip_net: 'Enter an IP network',
  subnet: 'Select a subnet',
  vpc: undefined,
}

const destinationValueDescription: Record<RouteDestination['type'], string | undefined> = {
  ip: 'An IP address, like 192.168.1.222',
  ip_net: 'An IP network, like 192.168.0.0/16',
  subnet: undefined,
  vpc: undefined,
}

/** possible targetTypes needing placeholders are instances or IPs (internet_gateway has no placeholder) */
const targetValuePlaceholder: Record<RouteTarget['type'], string | undefined> = {
  ip: 'Enter an IP',
  instance: 'Select an instance',
  internet_gateway: undefined,
  drop: undefined,
  subnet: undefined,
  vpc: undefined,
}

const targetValueDescription: Record<RouteTarget['type'], string | undefined> = {
  ip: 'An IP address, like 10.0.1.5',
  instance: undefined,
  internet_gateway: undefined,
  drop: undefined,
  subnet: undefined,
  vpc: undefined,
}

const toListboxItems = (mapping: Record<string, string>) =>
  Object.entries(mapping).map(([value, label]) => ({ value, label }))

type RouteFormFieldsProps = {
  form: UseFormReturn<RouteFormValues>
  disabled?: boolean
}
export const RouteFormFields = ({ form, disabled }: RouteFormFieldsProps) => {
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
    placeholder: destinationValuePlaceholder[destinationType],
    required: true,
    disabled,
    description: destinationValueDescription[destinationType],
    // need a default to prevent the text field validation function from
    // sticking around when we switch to the combobox
    validate: () => undefined,
  }
  const targetValueProps = {
    name: 'target.value' as const,
    label: 'Target value',
    control,
    placeholder: targetValuePlaceholder[targetType],
    required: true,
    // 'internet_gateway' targetTypes can only have the value 'outbound', so we disable the field
    disabled,
    description: targetValueDescription[targetType],
    // need a default to prevent the text field validation function from
    // sticking around when we switch to the combobox
    validate: () => undefined,
  }
  return (
    <>
      {disabled && (
        <Message variant="info" content={routeFormMessage.vpcSubnetNotModifiable} />
      )}
      <NameField name="name" control={control} disabled={disabled} />
      <DescriptionField name="description" control={control} disabled={disabled} />
      <ListboxField
        name="destination.type"
        label="Destination type"
        control={control}
        items={toListboxItems(destTypes)}
        placeholder="Select a destination type"
        required
        onChange={() => {
          form.setValue('destination.value', '')
          form.clearErrors('destination.value')
        }}
        disabled={disabled}
      />
      {destinationType === 'subnet' ? (
        <ComboboxField {...destinationValueProps} items={toComboboxItems(vpcSubnets)} />
      ) : (
        <TextField
          {...destinationValueProps}
          validate={(value, { destination }) =>
            (destination.type === 'ip_net' && validateIpNet(value)) ||
            (destination.type === 'ip' && validateIp(value)) ||
            // false is invalid but true and undefined are valid so we need this
            undefined
          }
        />
      )}
      <ListboxField
        name="target.type"
        label="Target type"
        control={control}
        items={toListboxItems(targetTypes)}
        placeholder="Select a target type"
        required
        onChange={() => {
          form.setValue('target.value', '')
          form.clearErrors('target.value')
        }}
        disabled={disabled}
      />
      {targetType === 'drop' ? null : targetType === 'instance' ? (
        <ComboboxField {...targetValueProps} items={toComboboxItems(instances)} />
      ) : (
        <TextField
          {...targetValueProps}
          validate={(value, { target }) =>
            (target.type === 'ip' && validateIp(value)) || undefined
          }
        />
      )}
    </>
  )
}
