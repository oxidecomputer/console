import { Button } from '@oxide/ui'
import React, { useState } from 'react'
import { useToast } from '../hooks'
import tw from 'twin.macro'

const useCounter = (initialValue: number): [number, () => void] => {
  const [value, setValue] = useState(initialValue)
  return [value, () => setValue((v) => v + 1)]
}

const Heading = tw.h2`mb-4 mt-8 text-lg text-green-400`

const ToastTestPage = () => {
  const addToast = useToast()

  const [counter, incrCounter] = useCounter(1)

  const [defaultCloseCounter, incrDefaultCloseCounter] = useCounter(0)
  const [shouldHaveTimeout, setShouldHaveTimout] = useState(false)

  const [actionCloseCounter, incrActionCloseCounter] = useCounter(0)
  const [actionCounter, incrActionCounter] = useCounter(0)

  const [confirmConfirmCounter, incrConfirmConfirmCounter] = useCounter(0)
  const [confirmCancelCounter, incrConfirmCancelCounter] = useCounter(0)

  const handleDefaultToast = () => {
    incrCounter()

    addToast({
      type: 'default',

      title: `Default Toast #${counter}`,
      onClose: incrDefaultCloseCounter,

      timeout: shouldHaveTimeout ? 5 : undefined,
    })
  }

  const handleActionToast = () => {
    incrCounter()

    addToast({
      type: 'action',

      title: `Action Toast #${counter}`,
      content: 'This is some test content',
      icon: 'checkO',

      action: 'Undo',
      onAction: incrActionCounter,

      onClose: incrActionCloseCounter,
    })
  }

  const handleConfirmToast = () => {
    incrCounter()

    addToast({
      type: 'confirm',

      title: `Confirm Toast #${counter}`,
      content: 'Are you sure you want to do this?',
      icon: 'warning',

      confirm: 'Yes',
      onConfirm: incrConfirmConfirmCounter,

      cancel: 'No',
      onCancel: incrConfirmCancelCounter,
    })
  }

  return (
    <div>
      <section>
        <Heading>Default Toast</Heading>
        <div>Toast Closed: {defaultCloseCounter} times</div>
        <label tw="block">
          Should have timeout?
          <input
            tw="ml-2"
            checked={shouldHaveTimeout}
            onChange={(e) => setShouldHaveTimout(e.target.checked)}
            type="checkbox"
          />
        </label>
        <Button tw="mt-4" onClick={handleDefaultToast}>
          Trigger Default Toast
        </Button>
      </section>
      <section>
        <Heading>Action Toast</Heading>
        <div>Toast Closed: {actionCloseCounter} times</div>
        <div>Toast Action clicked: {actionCounter} times</div>
        <Button tw="mt-4" onClick={handleActionToast}>
          Trigger Action Toast
        </Button>
      </section>
      <section>
        <Heading>Confirm Toast</Heading>
        <div>Toast Confirm Action clicked: {confirmConfirmCounter} times</div>
        <div>Toast Cancel Action clicked: {confirmCancelCounter} times</div>
        <Button tw="mt-4" onClick={handleConfirmToast}>
          Trigger Confirm Toast
        </Button>
      </section>
    </div>
  )
}

export default ToastTestPage
