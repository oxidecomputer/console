import type { ThreeEvent } from '@react-three/fiber'
import { useCallback, useRef } from 'react'
import type { Group, Object3D } from 'three'

type Props = JSX.IntrinsicElements['group'] & {
  disabled?: boolean
  selected: string | null
  setSelected: (value: string | null) => void
}

export function Select({ children, disabled = false, setSelected, ...props }: Props) {
  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()

      if (disabled) {
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
    [disabled, setSelected]
  )

  const ref = useRef<Group>(null!)

  return (
    <group ref={ref} onClick={onClick} {...props}>
      {children}
    </group>
  )
}
