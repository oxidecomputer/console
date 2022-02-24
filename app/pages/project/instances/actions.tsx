import type { Instance } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import type { MakeActions } from '@oxide/table'
import { Success16Icon } from '@oxide/ui'
import { isTruthy } from '@oxide/util'
import { useToast } from 'app/hooks'
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

type Options = {
  onSuccess?: () => void
}

export const useMakeInstanceActions = (
  projectParams: { orgName: string; projectName: string },
  { onSuccess }: Options
): MakeActions<Instance> => {
  const addToast = useToast()

  // if you also pass onSuccess to mutate(), this one is not overridden — this
  // one runs first, then the one passed to mutate()
  const opts = { onSuccess }
  const startInstance = useApiMutation('projectInstancesInstanceStart', opts)
  const stopInstance = useApiMutation('projectInstancesInstanceStop', opts)
  const rebootInstance = useApiMutation('projectInstancesInstanceReboot', opts)
  const deleteInstance = useApiMutation('projectInstancesDeleteInstance', opts)

  return (instance) => {
    const { name: instanceName } = instance
    return [
      showStart(instance) && {
        label: 'start',
        onActivate() {
          startInstance.mutate(
            { ...projectParams, instanceName },
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
            { ...projectParams, instanceName },
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
          rebootInstance.mutate({ ...projectParams, instanceName })
        },
        disabled: !instanceCan.reboot(instance),
      },
      {
        label: 'delete',
        onActivate() {
          deleteInstance.mutate(
            { ...projectParams, instanceName },
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
    ].filter(isTruthy)
  }
}
