import type { ThreeEvent } from '@react-three/fiber'
import { useCallback, useRef, useState } from 'react'
import type { Group, Object3D } from 'three'

type Props = JSX.IntrinsicElements['group'] & {
  disabled?: boolean
  selected: string | null
  setSelected: (value: string | null) => void
}

export function Select({ children, disabled = false, setSelected, ...props }: Props) {
  const [mouseDownPosition, setMouseDownPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  const onMouseDown = useCallback((e: ThreeEvent<MouseEvent>) => {
    // Record the mouse down position
    setMouseDownPosition({ x: e.clientX, y: e.clientY })
  }, [])

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()

      if (disabled) {
        return
      }

      // Check if the mouse has moved significantly since mouse down
      // If it has, it's likely a drag, so ignore this click
      if (
        mouseDownPosition &&
        (Math.abs(mouseDownPosition.x - e.clientX) > 5 ||
          Math.abs(mouseDownPosition.y - e.clientY) > 5)
      ) {
        return
      }

      const name = e.object.name

      let object: Object3D | null = null
      if (e.object === undefined) {
        return
      } else if (e.object && !name) {
        let tries = 0
        // Traverse the parent hierarchy until you find the nearest element with a "name"
        // Stops at 4 tries so it doesn't traverse the whole scene unecessarily
        let parent = e.object.parent
        while (parent && !parent.name && tries < 4) {
          parent = parent.parent
          tries++
        }
        object = parent
      } else {
        object = e.object
      }

      if (object) {
        setSelected(object.name)
      }
    },
    [disabled, setSelected, mouseDownPosition]
  )

  const ref = useRef<Group>(null!)

  return (
    <group ref={ref} onPointerDown={onMouseDown} onClick={onClick} {...props}>
      {children}
    </group>
  )
}
