import { animated, useTransition } from '@react-spring/web'

import { Toast } from '@oxide/ui'

import { useToastStore } from './index'

export function ToastStack() {
  const toasts = useToastStore((state) => state.toasts)
  const remove = useToastStore((state) => state.remove)

  const transition = useTransition(toasts, {
    keys: (toast) => toast.id,
    from: { opacity: 0, y: 10, scale: 95 },
    enter: { opacity: 1, y: 0, scale: 100 },
    leave: { opacity: 0, y: 10, scale: 95 },
    config: { duration: 100 },
  })

  return (
    <div className="pointer-events-auto fixed bottom-4 left-4 z-50 flex flex-col items-end space-y-2">
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
              remove(item.id)
              item.options.onClose?.()
            }}
          />
        </animated.div>
      ))}
    </div>
  )
}
