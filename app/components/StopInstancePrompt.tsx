/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type ReactNode } from 'react'

import { apiQueryClient, useApiMutation, type Instance } from '@oxide/api'

import { HL } from '~/components/HL'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { Message } from '~/ui/lib/Message'

type StopInstancePromptProps = {
  instance: Instance
  children: ReactNode
}

export function StopInstancePrompt({ instance, children }: StopInstancePromptProps) {
  const isStoppingInstance = instance.runState === 'stopping'

  const stopInstance = useApiMutation('instanceStop', {
    onSuccess: () => {
      // trigger polling by the top level InstancePage one
      apiQueryClient.invalidateQueries('instanceView')
      addToast(<>Stopping instance <HL>{instance.name}</HL></>) // prettier-ignore
    },
    onError: (error) => {
      addToast({
        variant: 'error',
        title: `Error stopping instance '${instance.name}'`,
        content: error.message,
      })
    },
  })

  return (
    <Message
      variant="notice"
      content={
        <>
          {children}{' '}
          <Button
            size="xs"
            className="mt-3"
            variant="notice"
            onClick={() =>
              stopInstance.mutateAsync({
                path: { instance: instance.name },
                query: { project: instance.projectId },
              })
            }
            loading={isStoppingInstance}
          >
            Stop instance
          </Button>
        </>
      }
    />
  )
}
