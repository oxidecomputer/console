import { Button } from '@oxide/ui'
import type { FC } from 'react'
import React, { useState } from 'react'
import { useToast } from '../hooks'

const ToastTestPage: FC = () => {
  const { addToast } = useToast()
  const [counter, setCounter] = useState(1)

  const handleDefaultToast = () => {
    setCounter(counter + 1)

    addToast({
      title: `Default Toast #${counter}`,
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
