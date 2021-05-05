import { Button, Text } from '@oxide/ui'
import type { FC } from 'react'
import React from 'react'
import { useToast } from '../hooks'

const ToastTestPage: FC = () => {
  const { addToast } = useToast()

  const handleDefaultToast = () => {
    console.log('handleDefaultToast')
    addToast({
      title: 'Default Toast',
      // TODO: remove onClose somehow
      onClose: () => null,
    })
  }

  return (
    <div>
      <h2>
        <Text size="lg" color="green500">
          Default Toast
        </Text>
      </h2>
      <Button onClick={() => handleDefaultToast()}>
        Trigger default toast
      </Button>
    </div>
  )
}

export default ToastTestPage
