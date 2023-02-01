import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useDialog } from 'react-aria'
import type { AriaDialogProps } from 'react-aria'

interface DialogProps extends AriaDialogProps {
  children: ReactNode
}

export function Dialog({ children, ...props }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { dialogProps } = useDialog(props, ref)

  return (
    <div {...dialogProps} ref={ref}>
      {children}
    </div>
  )
}
