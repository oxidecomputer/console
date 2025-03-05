/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useState, type ReactNode } from 'react'

import {
  instanceTransitioning,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  type Instance,
} from '@oxide/api'

import { HL } from '~/components/HL'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { Message } from '~/ui/lib/Message'

const POLL_INTERVAL_FAST = 2000 // 2 seconds

type StopInstancePromptProps = {
  instance: Instance
  children: ReactNode
}

export function StopInstancePrompt({ instance, children }: StopInstancePromptProps) {
  const queryClient = useApiQueryClient()
  const [isStoppingInstance, setIsStoppingInstance] = useState(false)

  const { data } = useApiQuery(
    'instanceView',
    {
      path: { instance: instance.name },
      query: { project: instance.projectId },
    },
    {
      refetchInterval:
        isStoppingInstance || instanceTransitioning(instance) ? POLL_INTERVAL_FAST : false,
    }
  )

  const { mutateAsync: stopInstanceAsync } = useApiMutation('instanceStop', {
    onSuccess: () => {
      setIsStoppingInstance(true)
      addToast(
        <>
          Stopping instance <HL>{instance.name}</HL>
        </>
      )
    },
    onError: (error) => {
      addToast({
        variant: 'error',
        title: `Error stopping instance '${instance.name}'`,
        content: error.message,
      })
      setIsStoppingInstance(false)
    },
  })

  const handleStopInstance = () => {
    stopInstanceAsync({
      path: { instance: instance.name },
      query: { project: instance.projectId },
    })
  }

  const currentInstance = data || instance

  useEffect(() => {
    if (!data) {
      return
    }
    if (isStoppingInstance && data.runState === 'stopped') {
      queryClient.invalidateQueries('instanceView')
      setIsStoppingInstance(false)
    }
  }, [isStoppingInstance, data, queryClient])

  if (
    !currentInstance ||
    (currentInstance.runState !== 'stopping' && currentInstance.runState !== 'running')
  ) {
    return null
  }

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
            onClick={handleStopInstance}
            loading={isStoppingInstance}
          >
            Stop instance
          </Button>
        </>
      }
    />
  )
}
