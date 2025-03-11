/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback } from 'react'

import { instanceCan, useApiMutation, type Instance } from '@oxide/api'

import { HL } from '~/components/HL'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import type { MenuAction, MenuActionItem } from '~/table/columns/action-col'
import { pb } from '~/util/path-builder'

import { fancifyStates } from './common'

type Options = {
  onSuccess?: () => void
  // delete needs special behavior on instance detail because you need to nav to
  // instances list. this is starting to be a code smell. if the API of this
  // hook has to expand to encompass the sum of all the APIs of these hooks it
  // call internally, the abstraction is not good
  onDelete?: () => void
  onResizeClick?: (instance: Instance) => void
}

export const useMakeInstanceActions = (
  { project }: { project: string },
  options: Options = {}
) => {
  // if you also pass onSuccess to mutate(), this one is not overridden — this
  // one runs first, then the one passed to mutate().
  //
  // We pull out the mutate functions because they are referentially stable,
  // while the whole useMutation result object is not. The async ones are used
  // when we need to confirm because the confirm modals want that.
  const opts = { onSuccess: options.onSuccess }
  const { mutateAsync: startInstanceAsync } = useApiMutation('instanceStart', opts)
  const { mutateAsync: stopInstanceAsync } = useApiMutation('instanceStop', opts)
  const { mutateAsync: rebootInstanceAsync } = useApiMutation('instanceReboot', opts)
  // delete has its own
  const { mutateAsync: deleteInstanceAsync } = useApiMutation('instanceDelete', {
    onSuccess: options.onDelete,
  })

  const { onResizeClick } = options

  const makeButtonActions = useCallback(
    // restrict to items for now so we don't have to handle links in the calling code
    (instance: Instance): MenuActionItem[] => {
      const instanceParams = { path: { instance: instance.name }, query: { project } }
      return [
        {
          label: 'Start',
          onActivate() {
            confirmAction({
              actionType: 'primary',
              doAction: () =>
                startInstanceAsync(instanceParams, {
                  onSuccess: () => addToast(<>Starting instance <HL>{instance.name}</HL></>), // prettier-ignore
                  onError: (error) =>
                    addToast({
                      variant: 'error',
                      title: `Error starting instance '${instance.name}'`,
                      content: error.message,
                    }),
                }),
              modalTitle: 'Confirm start instance',
              modalContent: (
                <p>
                  Are you sure you want to start <HL>{instance.name}</HL>?
                </p>
              ),
              errorTitle: `Error starting ${instance.name}`,
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
                    addToast(<>Stopping instance <HL>{instance.name}</HL></>), // prettier-ignore
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
            // don't list all the states, it's overwhelming
            <>Only {fancifyStates(['running'])} instances can be stopped</>
          ),
        },
      ]
    },
    [project, startInstanceAsync, stopInstanceAsync]
  )

  const makeMenuActions = useCallback(
    (instance: Instance): MenuAction[] => {
      const instanceParams = { path: { instance: instance.name }, query: { project } }
      return [
        {
          label: 'Reboot',
          onActivate() {
            confirmAction({
              actionType: 'danger',
              doAction: () =>
                rebootInstanceAsync(instanceParams, {
                  onSuccess: () =>
                    addToast(<>Rebooting instance <HL>{instance.name}</HL></>), // prettier-ignore
                }),
              modalTitle: 'Confirm reboot instance',
              modalContent: (
                <p>
                  Are you sure you want to reboot <HL>{instance.name}</HL>?
                </p>
              ),
              errorTitle: `Error rebooting ${instance.name}`,
            })
          },
          disabled: !instanceCan.reboot(instance) && (
            <>Only {fancifyStates(instanceCan.reboot.states)} instances can be rebooted</>
          ),
        },
        {
          label: 'Resize',
          onActivate: () => onResizeClick?.(instance),
          disabled: !instanceCan.resize(instance) && (
            <>Only {fancifyStates(instanceCan.resize.states)} instances can be resized</>
          ),
        },
        {
          label: 'View serial console',
          to: pb.serialConsole({ project, instance: instance.name }),
        },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              deleteInstanceAsync(instanceParams, {
                onSuccess: () =>
                  addToast(<>Deleting instance <HL>{instance.name}</HL></>), // prettier-ignore
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
    // Do not put `options` in here, refer to the property. options is not ref
    // stable. Extra renders here cause the row actions menu to close when it
    // shouldn't, like during polling on instance list.
    [project, deleteInstanceAsync, rebootInstanceAsync, onResizeClick]
  )

  return { makeButtonActions, makeMenuActions }
}
