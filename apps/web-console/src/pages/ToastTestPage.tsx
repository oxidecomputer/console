import { Button, Text } from '@oxide/ui'
import type { FC } from 'react'
import React, { useState } from 'react'
import { useToast } from '../hooks'

const useCounter = (initialValue: number): [number, () => void] => {
  const [value, setValue] = useState(initialValue)
  const increment = () => setValue((v) => v + 1)

  return [value, increment]
}

const ToastTestPage: FC = () => {
  const { addToast, addActionToast } = useToast()
  const [counter, incrementCounter] = useCounter(1)
  const [defaultCloseCounter, incrementDefaultCloseCounter] = useCounter(0)

  const [actionCloseCounter, incrementActionCloseCounter] = useCounter(0)
  const [actionActionCounter, incrementActionActionCounter] = useCounter(0)

  const handleDefaultToast = () => {
    incrementCounter()

    addToast({
      title: `Default Toast #${counter}`,
      onClose: incrementDefaultCloseCounter,
    })
  }

  const handleActionToast = () => {
    incrementCounter()

    addActionToast({
      title: `Action Toast #${counter}`,
      content: 'This is some test content',
      icon: 'checkO',

      action: 'Undo',
      onAction: incrementActionActionCounter,

      onClose: incrementActionCloseCounter,
    })
  }

  return (
    <div>
      <section style={{ marginBottom: '1rem' }}>
        <h2>
          <Text size="lg" color="green400">
            Default Toast
          </Text>
        </h2>
        <div>Default Toast Closed: {defaultCloseCounter} times</div>
        <br />
        <Button onClick={handleDefaultToast}>Trigger Default Toast</Button>
      </section>
      <section style={{ marginBlock: '1rem' }}>
        <h2>
          <Text size="lg" color="green400">
            Action Toast
          </Text>
        </h2>
        <div>Action Toast Closed: {actionCloseCounter} times</div>
        <div>Action Toast Action clicked: {actionActionCounter} times</div>
        <br />
        <Button onClick={handleActionToast}>Trigger Action Toast</Button>
      </section>
    </div>
  )
}

export default ToastTestPage
