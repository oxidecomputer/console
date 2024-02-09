/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  useNavigate,
  type LoaderFunctionArgs,
  type NavigateFunction,
} from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  type FloatingIp,
  type FloatingIpCreate,
  type SiloIpPool,
} from '@oxide/api'
import { validateIp } from '@oxide/util'

import {
  DescriptionField,
  ListboxField,
  NameField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import { getProjectSelector, useForm, useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

CreateFloatingIpSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('projectIpPoolList', {
    query: { ...getProjectSelector(params), limit: 1000 },
  })
  return null
}

type CreateSideModalFormProps = {
  /**
   * If defined, this overrides the usual mutation. Caller is responsible for
   * doing a dismiss behavior in onSubmit as well, because we are not calling
   * the RQ `onSuccess` defined for the mutation.
   */
  onSubmit?: (floatingIpCreate: FloatingIpCreate) => void
  /**
   * Passing navigate is a bit of a hack to be able to do a nav from the routes
   * file. The callers that don't need the arg can ignore it.
   */
  onDismiss?: (navigate: NavigateFunction) => void
  onSuccess?: (floatingIp: FloatingIp) => void
}

export function CreateFloatingIpSideModalForm({
  onSubmit,
  onSuccess,
}: CreateSideModalFormProps) {
  // Fetch 1000 to we can be sure to get them all. There should only be a few
  // anyway. Not prefetched because the prefetched one only gets 25 to match the
  // query table. This req is better to do async because they can't click make
  // default that fast anyway.
  const { data: allPools } = useApiQuery('projectIpPoolList', {
    query: { limit: 1000 },
  })

  const defaultPool = useMemo(
    () => (allPools ? allPools.items.find((p) => p.isDefault)?.name : undefined),
    [allPools]
  )

  const defaultValues: FloatingIpCreate = {
    name: '',
    description: '',
    // defaultPool doesn't seem to be getting set in the form when page is loaded directly
    pool: defaultPool,
    address: undefined,
  }

  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const addToast = useToast()
  const navigate = useNavigate()

  const createFloatingIp = useApiMutation('floatingIpCreate', {
    onSuccess(data) {
      queryClient.invalidateQueries('floatingIpList')
      addToast({ content: 'Your Floating IP has been created' })
      onSuccess?.(data)
      navigate(pb.floatingIps(projectSelector))
    },
  })

  const form = useForm({ defaultValues })

  const toListboxItem = (p: SiloIpPool) => {
    if (p.name !== defaultPool) {
      return {
        value: p.name,
        label: p.name,
      }
    }
    // For the default pool, add a label to the dropdown
    return {
      value: p.name,
      labelString: p.name,
      label: (
        <>
          {p.name}{' '}
          <span className="text-quaternary selected:text-accent-secondary">(default)</span>
        </>
      ),
    }
  }

  const [poolName] = useWatch({ control: form.control, name: ['pool'] })
  const isPoolSelected = poolName && poolName.length > 0

  return (
    <SideModalForm
      id="create-floating-ip-form"
      title="Create Floating IP"
      form={form}
      onDismiss={() => navigate(pb.floatingIps(projectSelector))}
      onSubmit={({ ...rest }) => {
        const body = { ...rest }
        onSubmit
          ? onSubmit(body)
          : createFloatingIp.mutate({ query: projectSelector, body })
      }}
      loading={createFloatingIp.isPending}
      submitError={createFloatingIp.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      {allPools && (
        <ListboxField
          name="pool"
          items={allPools?.items.map((p) => toListboxItem(p))}
          label="Pool"
          required
          control={form.control}
        />
      )}
      <TextField
        name="address"
        control={form.control}
        disabled={!isPoolSelected}
        transform={(ip) => (ip.trim() === '' ? undefined : ip)}
        validate={(ip) => (ip && !validateIp(ip).valid ? 'Not a valid IP address' : true)}
      />
    </SideModalForm>
  )
}
