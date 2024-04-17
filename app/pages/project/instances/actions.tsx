/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { instanceCan, useApiMutation, type Instance } from '@oxide/api'

import { HL } from '~/components/HL'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import type { MakeActions } from '~/table/columns/action-col'
import { pb } from '~/util/path-builder'

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

  // if you also pass onSuccess to mutate(), this one is not overridden — this
  // one runs first, then the one passed to mutate()
  const opts = { onSuccess: options.onSuccess }
  const startInstance = useApiMutation('instanceStart', opts)
  const stopInstance = useApiMutation('instanceStop', opts)
  const rebootInstance = useApiMutation('instanceReboot', opts)
  const deleteInstance = useApiMutation('instanceDelete', opts)

  return useCallback(
    (instance) => {
      const instanceSelector = { ...projectSelector, instance: instance.name }
      const instanceParams = { path: { instance: instance.name }, query: projectSelector }
      return [
        {
          label: 'Start',
          onActivate() {
            startInstance.mutate(instanceParams, {
              onSuccess: () => addToast({ title: `Starting instance '${instance.name}'` }),
              onError: (error) =>
                addToast({
                  variant: 'error',
                  title: `Error starting instance '${instance.name}'`,
                  content: error.message,
                }),
            })
          },
          disabled: !instanceCan.start(instance) && (
            <>Only {fancifyStates(instanceCan.start.states)} instances can be started</>
          ),
        },
        {
          label: 'Stop',
          onActivate() {
            confirmAction({
              actionType: 'danger',
              doAction: async () =>
                stopInstance.mutate(instanceParams, {
                  onSuccess: () =>
                    addToast({ title: `Stopping instance '${instance.name}'` }),
                  onError: (error) =>
                    addToast({
                      variant: 'error',
                      title: `Error stopping instance '${instance.name}'`,
                      content: error.message,
                    }),
                }),
              modalTitle: 'Confirm stop instance',
              modalContent: (
                <p>
                  Are you sure you want to stop <HL>{instance.name}</HL>? Stopped instances
                  retain attached disks and IP addresses, but allocated CPU and memory are
                  freed.
                </p>
              ),
              errorTitle: `Could not stop ${instance.name}`,
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
              onSuccess: () => addToast({ title: `Rebooting instance '${instance.name}'` }),
              onError: (error) =>
                addToast({
                  variant: 'error',
                  title: `Error rebooting instance '${instance.name}'`,
                  content: error.message,
                }),
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
                  addToast({ title: `Deleting instance '${instance.name}'` })
                },
              }),
            label: instance.name,
            resourceKind: 'instance',
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
    ]
  )
}
