/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useWatch, type FieldPath, type FieldValues } from 'react-hook-form'

import { useApiQuery } from '@oxide/api'

import { useProjectSelector } from '~/hooks'

import { ListboxField, type ListboxFieldProps } from './ListboxField'

type SubnetListboxProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<ListboxFieldProps<TFieldValues, TName>, 'items'> & {
  vpcNameField: FieldPath<TFieldValues>
}

/**
 * Read the selected VPC name from the Formik context and fetch the subnets for
 * that VPC. Only fetch if the VPC name is that of an existing VPC.
 *
 * Needs to be its own component so it can go *inside* the `<Formik>` element in
 * order to have access to the context.
 */
export function SubnetListbox<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ vpcNameField, control, ...fieldProps }: SubnetListboxProps<TFieldValues, TName>) {
  const projectSelector = useProjectSelector()

  const [vpcName] = useWatch({ control, name: [vpcNameField] })

  // assume vpc exists if it's non-empty since it came from the listbox
  const vpcExists = vpcName.length > 0

  // TODO: error handling other than fallback to empty list?
  const subnets =
    useApiQuery(
      'vpcSubnetList',
      { query: { ...projectSelector, vpc: vpcName } },
      { enabled: vpcExists, throwOnError: false }
    ).data?.items || []

  return (
    <ListboxField
      {...fieldProps}
      items={subnets.map(({ name }) => ({ value: name, label: name }))}
      disabled={!vpcExists}
      control={control}
      placeholder="Select a subnet"
      noItemsPlaceholder="Select a VPC to see subnets"
    />
  )
}
