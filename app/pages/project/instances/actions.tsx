/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { type Instance, instanceCan, useApiMutation } from '@oxide/api'
import type { MakeActions } from '@oxide/table'
import { toPathQuery } from '@oxide/util'

import { useToast } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'
import { pb } from 'app/util/path-builder'

import { fancifyStates } from './instance/tabs/common'

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

  // if you also pass onSuccess to mutate(), this one is not overridden — this
  // one runs first, then the one passed to mutate()
  const opts = { onSuccess: options.onSuccess }
  const startInstance = useApiMutation('instanceStart', opts)
  const stopInstance = useApiMutation('instanceStop', opts)
  const rebootInstance = useApiMutation('instanceReboot', opts)
  const deleteInstance = useApiMutation('instanceDelete', opts)

  return useCallback(
    (instance) => {
      const successToast = (title: string) => addToast({ title })
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
          disabled: !instanceCan.start(instance) && (
            <>Only {fancifyStates(instanceCan.start.states)} instances can be started</>
          ),
        },
        {
          label: 'Stop',
          onActivate() {
            stopInstance.mutate(instanceParams, {
              onSuccess: () => successToast(`Stopping instance '${instanceName}'`),
            })
          },
          disabled: !instanceCan.stop(instance) && (
            <>Only {fancifyStates(instanceCan.stop.states)} instances can be stopped</>
          ),
        },
        {
          label: 'Reboot',
          onActivate() {
            rebootInstance.mutate(instanceParams, {
              onSuccess: () => successToast(`Rebooting instance '${instanceName}'`),
            })
          },
          disabled: !instanceCan.reboot(instance) && (
            <>Only {fancifyStates(instanceCan.reboot.states)} instances can be rebooted</>
          ),
        },
        {
          label: 'View serial console',
          onActivate() {
            navigate(pb.serialConsole(instanceSelector))
          },
        },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              deleteInstance.mutateAsync(instanceParams, {
                onSuccess: () => {
                  options.onDelete?.()
                  successToast(`Deleting instance '${instanceName}'`)
                },
              }),
            label: instanceName,
          }),
          disabled: !instanceCan.delete(instance) && (
            <>Only {fancifyStates(instanceCan.delete.states)} instances can be deleted</>
          ),
          className: instanceCan.delete(instance) ? 'destructive' : '',
        },
      ]
    },
    [
      projectSelector,
      deleteInstance,
      navigate,
      options,
      rebootInstance,
      startInstance,
      stopInstance,
      addToast,
    ]
  )
}
