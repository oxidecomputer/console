import { animated, useTransition } from '@react-spring/web'

import { Toast } from '@oxide/ui'

import type { Toast as ToastModel } from './types'

interface ToastStackProps {
  toasts: ToastModel[]
  onRemoveToast: (id: string) => void
}

export const ToastStack = ({ toasts, onRemoveToast }: ToastStackProps) => {
  const transition = useTransition(toasts, {
    keys: (toast) => toast.id,
    from: { opacity: 0, y: 10, scale: 95 },
    enter: { opacity: 1, y: 0, scale: 100 },
    leave: { opacity: 0, y: 10, scale: 95 },
    config: { duration: 100 },
  })

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      {transition((style, item) => (
        <animated.div
          style={{
            opacity: style.opacity,
            y: style.y,
            transform: style.scale.to((val) => `scale(${val}%, ${val}%)`),
          }}
        >
          <Toast
            key={item.id}
            {...item.options}
            onClose={() => {
              onRemoveToast(item.id)
              item.options.onClose?.()
            }}
          />
        </animated.div>
      ))}
    </div>
  )
}
