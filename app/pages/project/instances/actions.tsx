import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { type Instance, useApiMutation } from '@oxide/api'
import type { MakeActions } from '@oxide/table'
import { Success12Icon } from '@oxide/ui'
import { toPathQuery } from '@oxide/util'

import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const instanceCan: Record<string, (i: Instance) => boolean> = {
  start: (i) => i.runState === 'stopped',
  reboot: (i) => i.runState === 'running',
  stop: (i) => i.runState === 'running',
  delete: (i) => i.runState === 'stopped',
}

type Options = {
  onSuccess?: () => void
  // delete needs special behavior on instance detail because you need to nav to
  // instances list. this is starting to be a code smell. if the API of this
  // hook has to expand to encompass the sum of all the APIs of these hooks it
  // call internally, the abstraction is not good
  onDelete?: () => void
}

export const useMakeInstanceActions = (
  projectSelector: { project: string },
  options: Options = {}
): MakeActions<Instance> => {
  const navigate = useNavigate()
  const addToast = useToast()
  const successToast = (title: string) => addToast({ icon: <Success12Icon />, title })

  // if you also pass onSuccess to mutate(), this one is not overridden — this
  // one runs first, then the one passed to mutate()
  const opts = { onSuccess: options.onSuccess }
  const startInstance = useApiMutation('instanceStart', opts)
  const stopInstance = useApiMutation('instanceStop', opts)
  const rebootInstance = useApiMutation('instanceReboot', opts)
  const deleteInstance = useApiMutation('instanceDelete', opts)

  return useCallback((instance) => {
    const instanceName = instance.name
    const instanceSelector = { ...projectSelector, instance: instanceName }
    const instanceParams = toPathQuery('instance', instanceSelector)
    return [
      {
        label: 'Start',
        onActivate() {
          startInstance.mutate(instanceParams, {
            onSuccess: () => successToast(`Starting instance '${instanceName}'`),
          })
        },
        disabled: !instanceCan.start(instance) && 'Only stopped instances can be started',
      },
      {
        label: 'Stop',
        onActivate() {
          stopInstance.mutate(instanceParams, {
            onSuccess: () => successToast(`Stopping instance '${instanceName}'`),
          })
        },
        disabled: !instanceCan.stop(instance) && 'Only running instances can be stopped',
      },
      {
        label: 'Reboot',
        onActivate() {
          rebootInstance.mutate(instanceParams, {
            onSuccess: () => successToast(`Rebooting instance '${instanceName}'`),
          })
        },
        disabled: !instanceCan.reboot(instance) && 'Only running instances can be rebooted',
      },
      {
        label: 'View serial console',
        onActivate() {
          navigate(pb.serialConsole(instanceSelector))
        },
      },
      {
        label: 'Delete',
        onActivate() {
          deleteInstance.mutate(instanceParams, {
            onSuccess: () => {
              options.onDelete?.()
              successToast(`Deleting instance '${instanceName}'`)
            },
          })
        },
        disabled: !instanceCan.delete(instance) && 'Only stopped instances can be deleted',
        className: instanceCan.delete(instance) ? 'destructive' : '',
      },
    ]
    // TODO: fix this lol
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
