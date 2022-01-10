import { Button, Comment16Icon, Success16Icon } from '@oxide/ui'
import React, { useState } from 'react'
import { useToast } from '../hooks'
import { classed } from '@oxide/util'

const useCounter = (initialValue: number): [number, () => void] => {
  const [value, setValue] = useState(initialValue)
  return [value, () => setValue((v) => v + 1)]
}

const Heading = classed.h2`mb-4 mt-8 text-lg text-green-500`

const ToastTestPage = () => {
  const addToast = useToast()

  const [counter, incrCounter] = useCounter(1)

  const [defaultCloseCounter, incrDefaultCloseCounter] = useCounter(0)
  const [shouldHaveTimeout, setShouldHaveTimout] = useState(false)

  const handleDefaultToast = () => {
    incrCounter()

    addToast({
      variant: 'success',

      title: `Default Toast #${counter}`,
      icon: <Success16Icon />,
      onClose: incrDefaultCloseCounter,

      timeout: shouldHaveTimeout ? 5000 : undefined,
    })
  }

  const handleInfoToast = () => {
    addToast({
      variant: 'info',
      title: 'Some info here',
      icon: <Comment16Icon />,
      timeout: shouldHaveTimeout ? 5000 : undefined,
    })
  }

  return (
    <div>
      <section>
        <Heading>Default Toast</Heading>
        <div>Toast Closed: {defaultCloseCounter} times</div>
        <label className="block">
          Should have timeout?
          <input
            className="ml-2"
            checked={shouldHaveTimeout}
            onChange={(e) => setShouldHaveTimout(e.target.checked)}
            type="checkbox"
          />
        </label>
        <Button className="mt-4" onClick={handleDefaultToast}>
          Trigger Default Toast
        </Button>
        <Button className="mt-4 ml-2" onClick={handleInfoToast}>
          Trigger Info Toast
        </Button>
      </section>
    </div>
  )
}

export default ToastTestPage
