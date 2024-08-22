/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo } from 'react'

import { useApiQuery } from '~/api'
import { useVpcSelector } from '~/hooks'

export const useCustomRouterItems = () => {
  const vpcSelector = useVpcSelector()
  const routers = useApiQuery('vpcRouterList', { query: { ...vpcSelector } })
  const routerItems = useMemo(() => {
    return (
      routers?.data?.items
        .filter((item) => item.kind === 'custom')
        .map((router) => ({ value: router.id, label: router.name })) || []
    )
  }, [routers])

  return { isLoading: routers.isLoading, items: routerItems }
}

// This is a custom hook that returns a list of subnets for a given VPC
// If no VPC is provided, it will use the VPC from the VPC selector
export const useVpcSubnetItems = ({ project, vpc }: { project: string; vpc?: string }) => {
  const vpcSubnets = useApiQuery(
    'vpcSubnetList',
    { query: { project, vpc } },
    { enabled: !!vpc }
  )
  const vpcSubnetItems = useMemo(() => {
    return (
      vpcSubnets?.data?.items.map((subnet) => ({
        value: subnet.name,
        label: subnet.name,
      })) || []
    )
  }, [vpcSubnets])

  return { isLoading: vpcSubnets.isLoading, items: vpcSubnetItems }
}

export const useInstanceItems = () => {
  const instances = useApiQuery('instanceList', {})
  const instanceItems = useMemo(() => {
    return (
      instances?.data?.items.map((instance) => ({
        value: instance.id,
        label: instance.name,
      })) || []
    )
  }, [instances])

  return { isLoading: instances.isLoading, items: instanceItems }
}
