import React from 'react'
import type { Instance } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import type { MakeActions } from '@oxide/table'
import { Success16Icon } from '@oxide/ui'
import { useToast } from 'app/hooks'

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
  opts: Options = {}
): MakeActions<Instance> => {
  const addToast = useToast()
  const successToast = (title: string) =>
    addToast({ icon: <Success16Icon />, title, timeout: 5000 })

  // if you also pass onSuccess to mutate(), this one is not overridden — this
  // one runs first, then the one passed to mutate()
  const startInstance = useApiMutation('projectInstancesInstanceStart', opts)
  const stopInstance = useApiMutation('projectInstancesInstanceStop', opts)
  const rebootInstance = useApiMutation('projectInstancesInstanceReboot', opts)
  const deleteInstance = useApiMutation('projectInstancesDeleteInstance', opts)

  return (instance) => {
    const { name: instanceName } = instance
    return [
      {
        label: 'Start',
        onActivate() {
          startInstance.mutate(
            { ...projectParams, instanceName },
            {
              onSuccess: () =>
                successToast(`Starting instance '${instanceName}'`),
            }
          )
        },
        disabled: !instanceCan.start(instance),
      },
      {
        label: 'Stop',
        onActivate() {
          stopInstance.mutate(
            { ...projectParams, instanceName },
            {
              onSuccess: () =>
                successToast(`Stopping instance '${instanceName}'`),
            }
          )
        },
        disabled: !instanceCan.stop(instance),
      },
      {
        label: 'Reboot',
        onActivate() {
          rebootInstance.mutate(
            { ...projectParams, instanceName },
            {
              onSuccess: () =>
                successToast(`Rebooting instance '${instanceName}'`),
            }
          )
        },
        disabled: !instanceCan.reboot(instance),
      },
      {
        label: 'Delete',
        onActivate() {
          deleteInstance.mutate(
            { ...projectParams, instanceName },
            {
              onSuccess: () =>
                successToast(`Deleting instance '${instanceName}'`),
            }
          )
        },
        disabled: !instanceCan.delete(instance),
      },
    ]
  }
}
