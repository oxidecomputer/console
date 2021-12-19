import type {
  ApiListMethods,
  Instance,
  ProjectInstancesGetParams,
} from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { MakeActions } from '@oxide/table'
import { Success16Icon } from '@oxide/ui'
import { useToast } from '../../../hooks'
import React from 'react'

const showStart = (i: Instance): boolean => {
  switch (i.runState) {
    case 'stopped':
    case 'stopping':
      return true
    default:
      return false
  }
}

const instanceCan: Record<string, (i: Instance) => boolean> = {
  start: (i) => i.runState === 'stopped',
  reboot: (i) => i.runState === 'running',
  stop: (i) => i.runState === 'running',
  delete: (i) => i.runState === 'stopped',
}

export const useInstanceActions = (
  params: ProjectInstancesGetParams
): MakeActions<ApiListMethods, 'projectInstancesGet'> => {
  const addToast = useToast()
  const queryClient = useApiQueryClient()
  const refetch = () =>
    queryClient.invalidateQueries('projectInstancesGet', params)

  const startInstance = useApiMutation('projectInstancesInstanceStart', {
    onSuccess() {
      refetch()
    },
  })
  const stopInstance = useApiMutation('projectInstancesInstanceStop', {
    onSuccess() {
      refetch()
    },
  })
  const rebootInstance = useApiMutation('projectInstancesInstanceReboot', {
    onSuccess() {
      refetch()
    },
  })
  const deleteInstance = useApiMutation('projectInstancesDeleteInstance', {
    onSuccess() {
      refetch()
    },
  })

  return (instance) => {
    const { name: instanceName } = instance
    return [
      showStart(instance) && {
        label: 'start',
        onActivate() {
          startInstance.mutate(
            { ...params, instanceName },
            {
              onSuccess() {
                addToast({
                  icon: <Success16Icon />,
                  title: `Starting instance '${instanceName}'`,
                  timeout: 5000,
                })
              },
            }
          )
        },
        disabled: !instanceCan.start(instance),
      },
      !showStart(instance) && {
        label: 'stop',
        onActivate() {
          stopInstance.mutate(
            { ...params, instanceName },
            {
              onSuccess() {
                addToast({
                  icon: <Success16Icon />,
                  title: `Stopping instance '${instanceName}'`,
                  timeout: 5000,
                })
              },
            }
          )
        },
        disabled: !instanceCan.stop(instance),
      },
      {
        label: 'reboot',
        onActivate() {
          rebootInstance.mutate({ ...params, instanceName })
        },
        disabled: !instanceCan.reboot(instance),
      },
      {
        label: 'delete',
        onActivate() {
          deleteInstance.mutate(
            { ...params, instanceName },
            {
              onSuccess() {
                addToast({
                  icon: <Success16Icon />,
                  title: `Deleting instance '${instanceName}'`,
                  timeout: 5000,
                })
              },
            }
          )
        },
        disabled: !instanceCan.delete(instance),
      },
    ]
  }
}
