import { Button, Text } from '@oxide/ui'
import type { FC } from 'react'
import React, { useState } from 'react'
import { useToast } from '../hooks'

const ToastTestPage: FC = () => {
  const { addToast } = useToast()
  const [counter, setCounter] = useState(1)
  const [defaultCloseCounter, setDefaultCloseCounter] = useState(0)

  const handleDefaultToast = () => {
    setCounter(counter + 1)

    addToast({
      title: `Default Toast #${counter}`,
      // TODO: remove onClose somehow
      onClose: () => setDefaultCloseCounter((v) => v + 1),
    })
  }

  return (
    <div>
      <section>
        <h2>
          <Text size="lg" color="green400">
            Default Toast
          </Text>
        </h2>
        <div>Default Closed: {defaultCloseCounter}</div>
        <br />
        <Button onClick={handleDefaultToast}>Trigger default toast</Button>
      </section>
    </div>
  )
}

export default ToastTestPage
