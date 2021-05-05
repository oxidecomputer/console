import { Button } from '@oxide/ui'
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
      <Button onClick={handleDefaultToast}>Trigger default toast</Button>
    </div>
  )
}

export default ToastTestPage
