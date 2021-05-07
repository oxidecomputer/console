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
  const { addToast } = useToast()

  const [counter, incrementCounter] = useCounter(1)

  const [defaultCloseCounter, incrementDefaultCloseCounter] = useCounter(0)
  const [shouldHaveTimeout, setShouldHaveTimout] = useState(false)

  const [actionCloseCounter, incrementActionCloseCounter] = useCounter(0)
  const [actionActionCounter, incrementActionActionCounter] = useCounter(0)

  const [
    confirmConfirmActionCounter,
    incrementConfirmConfirmActionCounter,
  ] = useCounter(0)
  const [
    confirmCancelActionCounter,
    incrementConfirmCancelActionCounter,
  ] = useCounter(0)

  const handleDefaultToast = () => {
    incrementCounter()

    addToast({
      type: 'default',

      title: `Default Toast #${counter}`,
      onClose: incrementDefaultCloseCounter,

      timeout: shouldHaveTimeout ? 5 : undefined,
    })
  }

  const handleActionToast = () => {
    incrementCounter()

    addToast({
      type: 'action',

      title: `Action Toast #${counter}`,
      content: 'This is some test content',
      icon: 'checkO',

      action: 'Undo',
      onAction: incrementActionActionCounter,

      onClose: incrementActionCloseCounter,
    })
  }

  const handleConfirmToast = () => {
    incrementCounter()

    addToast({
      type: 'confirm',

      title: `Confirm Toast #${counter}`,
      content: 'Are you sure you want to do this?',
      icon: 'warning',

      confirm: 'Yes',
      onConfirm: incrementConfirmConfirmActionCounter,

      cancel: 'No',
      onCancel: incrementConfirmCancelActionCounter,
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
        <div>Toast Closed: {defaultCloseCounter} times</div>
        <br />
        <label>
          Should have timeout?
          <input
            checked={shouldHaveTimeout}
            onChange={(e) => setShouldHaveTimout(e.target.checked)}
            type="checkbox"
          />
        </label>
        <br />
        <Button onClick={handleDefaultToast}>Trigger Default Toast</Button>
      </section>
      <section style={{ marginBlock: '1rem' }}>
        <h2>
          <Text size="lg" color="green400">
            Action Toast
          </Text>
        </h2>
        <div>Toast Closed: {actionCloseCounter} times</div>
        <div>Toast Action clicked: {actionActionCounter} times</div>
        <br />
        <Button onClick={handleActionToast}>Trigger Action Toast</Button>
      </section>
      <section style={{ marginBlock: '1rem' }}>
        <h2>
          <Text size="lg" color="green400">
            Confirm Toast
          </Text>
        </h2>
        <div>
          Toast Confirm Action clicked: {confirmConfirmActionCounter} times
        </div>
        <div>
          Toast Cancel Action clicked: {confirmCancelActionCounter} times
        </div>
        <br />
        <Button onClick={handleConfirmToast}>Trigger Confirm Toast</Button>
      </section>
    </div>
  )
}

export default ToastTestPage
