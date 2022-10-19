import { useField } from 'formik'

import type { Vpc } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

import { useRequiredParams } from 'app/hooks'

import type { ListboxFieldProps } from './ListboxField'
import { ListboxField } from './ListboxField'

type SubnetListboxProps = Omit<ListboxFieldProps, 'items'> & {
  /** `name` of the Formik field to read the `vpcName` from */
  vpcNameField: string
  /**
   * We use this to check that the `vpcName` is real so we can avoid trying to
   * fetch subnets for nonexistent VPCs. We could fetch the list in the
   * component instead, but we'd have to make sure the params match exactly to
   * ensure RQ dedupes the request
   */
  vpcs: Vpc[]
}

/**
 * Read the selected VPC name from the Formik context and fetch the subnets for
 * that VPC. Only fetch if the VPC name is that of an existing VPC.
 *
 * Needs to be its own component so it can go *inside* the `<Formik>` element in
 * order to have access to the context.
 */
export function SubnetListbox({ vpcNameField, vpcs, ...fieldProps }: SubnetListboxProps) {
  const pathParams = useRequiredParams('orgName', 'projectName')
  const [, { value: vpcNameRaw }] = useField<string>({ name: vpcNameField })

  const vpcName = vpcNameRaw.trim()

  const vpcExists = vpcName.length > 0 && vpcs.map((x) => x.name).includes(vpcName)

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
    />
  )
}
