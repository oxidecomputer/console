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
  { project }: { project: string },
  options: Options = {}
) => {
  const navigate = useNavigate()
  // if you also pass onSuccess to mutate(), this one is not overridden — this
  // one runs first, then the one passed to mutate().
  //
  // We pull out the mutate functions because they are referentially stable,
  // while the whole useMutation result object is not. The async ones are used
  // when we need to confirm because the confirm modals want that.
  const opts = { onSuccess: options.onSuccess }
  const { mutate: startInstance } = useApiMutation('instanceStart', opts)
  const { mutateAsync: stopInstanceAsync } = useApiMutation('instanceStop', opts)
  const { mutate: rebootInstance } = useApiMutation('instanceReboot', opts)
  // delete has its own
  const { mutateAsync: deleteInstanceAsync } = useApiMutation('instanceDelete', {
    onSuccess: options.onDelete,
  })

  const makeButtonActions = useCallback(
    (instance: Instance) => {
      const instanceParams = { path: { instance: instance.name }, query: { project } }
      return [
        {
          label: 'Start',
          onActivate() {
            startInstance(instanceParams, {
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
              doAction: () =>
                stopInstanceAsync(instanceParams, {
                  onSuccess: () =>
                    addToast({ title: `Stopping instance '${instance.name}'` }),
                }),
              modalTitle: 'Confirm stop instance',
              modalContent: (
                <div className="space-y-2">
                  <p>
                    Are you sure you want to stop <HL>{instance.name}</HL>?
                  </p>
                  <p>
                    Stopped instances retain attached disks and IP addresses, but allocated
                    CPU and memory are freed.
                  </p>
                </div>
              ),
              errorTitle: `Error stopping ${instance.name}`,
            })
          },
          disabled: !instanceCan.stop(instance) && (
            <>Only {fancifyStates(instanceCan.stop.states)} instances can be stopped</>
          ),
        },
      ]
    },
    [project, startInstance, stopInstanceAsync]
  )

  const makeMenuActions = useCallback(
    (instance: Instance) => {
      const instanceSelector = { project, instance: instance.name }
      const instanceParams = { path: { instance: instance.name }, query: { project } }
      return [
        {
          label: 'Reboot',
          onActivate() {
            rebootInstance(instanceParams, {
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
              deleteInstanceAsync(instanceParams, {
                onSuccess: () =>
                  addToast({ title: `Deleting instance '${instance.name}'` }),
              }),
            label: instance.name,
            resourceKind: 'instance',
            extraContent: 'Any attached disks will be detached but not deleted.',
          }),
          disabled: !instanceCan.delete(instance) && (
            <>Only {fancifyStates(instanceCan.delete.states)} instances can be deleted</>
          ),
          className: instanceCan.delete(instance) ? 'destructive' : '',
        },
      ]
    },
    [project, deleteInstanceAsync, navigate, rebootInstance]
  )

  return { makeButtonActions, makeMenuActions }
}
