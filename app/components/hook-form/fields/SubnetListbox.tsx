import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { useApiQuery } from '@oxide/api'

import { useRequiredParams } from 'app/hooks'

import type { ListboxFieldProps } from './ListboxField'
import { ListboxField } from './ListboxField'

type SubnetListboxProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = Omit<ListboxFieldProps<TFieldValues, TName>, 'items'> & {
  /** `name` of the Formik field to read the `vpcName` from */
  vpcNameField: FieldPath<TFieldValues>
  control: Control<TFieldValues>
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
  TName extends FieldPath<TFieldValues>
>({ vpcNameField, control, ...fieldProps }: SubnetListboxProps<TFieldValues, TName>) {
  const pathParams = useRequiredParams('orgName', 'projectName')

  const [vpcName] = useWatch({ control, name: [vpcNameField] })

  // assume vpc exists if it's non-empty since it came from the listbox
  const vpcExists = vpcName.length > 0

  // TODO: error handling other than fallback to empty list?
  const subnets =
    useApiQuery(
      'vpcSubnetList',
      { path: { ...pathParams, vpcName } },
      {
        enabled: vpcExists,
        useErrorBoundary: false,
      }
    ).data?.items || []

  return (
    <ListboxField
      {...fieldProps}
      items={subnets.map(({ name }) => ({ value: name, label: name }))}
      disabled={!vpcExists}
      control={control}
    />
  )
}
