import { DismissButton, Overlay, usePopover } from '@react-aria/overlays'
import type { AriaPopoverProps } from '@react-aria/overlays'
import { useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { OverlayTriggerState } from 'react-stately'

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  state: OverlayTriggerState
  children: ReactNode
  matchTriggerWidth?: boolean
  popoverRef?: RefObject<HTMLDivElement>
}

export function Popover(props: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { popoverRef = ref, state, children } = props

  const { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef,
    },
    state
  )

  const triggerEl = props.triggerRef && (props.triggerRef.current as HTMLButtonElement)
  const width = triggerEl && props.matchTriggerWidth ? triggerEl.offsetWidth : undefined

  // Add a hidden <DismissButton> component at the end of the popover
  // to allow screen reader users to dismiss the popup easily.
  return (
    <Overlay>
      <div {...underlayProps} className="fixed inset-0" />
      <div
        {...popoverProps}
        ref={popoverRef}
        className="rounded-md absolute top-full z-10 rounded-lg border bg-raise border-default elevation-2"
        style={{
          width,
        }}
      >
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  )
}
