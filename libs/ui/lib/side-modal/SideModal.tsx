import * as Dialog from '@radix-ui/react-dialog'
import { animated, useTransition } from '@react-spring/web'
import cn from 'classnames'
import React, { type ReactNode, useEffect, useRef } from 'react'

import { Message } from '@oxide/ui'
import { classed } from '@oxide/util'

import { useIsOverflow } from 'app/hooks'

import { Close12Icon, Error12Icon, OpenLink12Icon } from '../icons'
import './side-modal.css'

export type SideModalProps = {
  title?: string
  subtitle?: ReactNode
  onDismiss: () => void
  isOpen: boolean
  children?: React.ReactNode
  errors?: string[]
  /**
   * Whether the modal should animate in. It never animates out. Default `true`.
   * Used to prevent animation from firing when we show the modal directly on a
   * fresh pageload.
   */
  animate?: boolean
}

export function SideModal({
  children,
  onDismiss,
  title,
  subtitle,
  isOpen,
  animate = true,
  errors,
}: SideModalProps) {
  const titleId = 'side-modal-title'
  const AnimatedDialogContent = animated(Dialog.Content)

  const config = { tension: 650, mass: 0.125 }

  const transitions = useTransition(isOpen, {
    from: { x: 50 },
    enter: { x: 0 },
    config: isOpen && animate ? config : { duration: 0 },
  })

  useEffect(() => {
    document.body.classList.add('pointer-events-none')

    return () => {
      document.body.classList.remove('pointer-events-none')
    }
  }, [])

  return transitions(
    ({ x }, item) =>
      item && (
        <Dialog.Root
          open
          onOpenChange={(open) => {
            if (!open) onDismiss()
          }}
          modal={false}
        >
          <Dialog.Portal>
            <div
              className="DialogOverlay pointer-events-auto"
              onClick={onDismiss}
              aria-hidden
            />
            <AnimatedDialogContent
              className="DialogContent ox-side-modal pointer-events-auto fixed right-0 top-0 bottom-0 m-0 flex w-[32rem] flex-col justify-between border-l p-0 bg-raise border-secondary elevation-2"
              aria-labelledby={titleId}
              style={{
                transform: x.to((value) => `translate3d(${value}%, 0px, 0px)`),
              }}
            >
              {title && (
                <Dialog.Title asChild>
                  <>
                    <SideModal.Title id={titleId} title={title} subtitle={subtitle} />

                    {errors && errors.length > 0 && (
                      <div className="mb-6">
                        <Message
                          variant="error"
                          content={
                            errors.length === 1 ? (
                              errors[0]
                            ) : (
                              <>
                                <div>{errors.length} issues:</div>
                                <ul className="ml-4 list-disc">
                                  {errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                  ))}
                                </ul>
                              </>
                            )
                          }
                          title={errors.length > 1 ? 'Errors' : 'Error'}
                        />
                      </div>
                    )}
                  </>
                </Dialog.Title>
              )}
              {children}
            </AnimatedDialogContent>
          </Dialog.Portal>
        </Dialog.Root>
      )
  )
}

export const ResourceLabel = classed.h3`mt-2 flex items-center gap-1.5 text-sans-md text-accent`

SideModal.Title = ({
  title,
  id,
  subtitle,
}: {
  title: string
  id?: string
  subtitle?: ReactNode
}) => (
  <div className="items-top mt-8 mb-4">
    <h2 className="flex w-full items-center justify-between pr-8 text-sans-2xl" id={id}>
      {title}
    </h2>
    {subtitle}
  </div>
)

// separate component because otherwise eslint thinks it's not a component and
// gets mad about the use of hooks
function SideModalBody({ children }: { children?: ReactNode }) {
  const overflowRef = useRef<HTMLDivElement>(null)
  const { scrollStart } = useIsOverflow(overflowRef, 'vertical')

  return (
    <div
      ref={overflowRef}
      className={cn(
        'body relative h-full overflow-y-auto pb-12 pt-8',
        !scrollStart && 'border-t border-t-secondary'
      )}
    >
      {children}
    </div>
  )
}

SideModal.Body = SideModalBody

SideModal.Section = classed.div`p-8 space-y-6 border-secondary`

SideModal.Docs = ({ children }: { children?: ReactNode }) => (
  <SideModal.Section>
    <div>
      <h3 className="mb-2 text-sans-semi-md">Relevant docs</h3>
      <ul className="space-y-0.5 text-sans-md text-secondary">
        {React.Children.map(children, (child) => (
          <li className="flex items-center space-x-2">
            <OpenLink12Icon className="mt-0.5 text-accent" />
            {child}
          </li>
        ))}
      </ul>
    </div>
  </SideModal.Section>
)

SideModal.Footer = ({ children, error }: { children: ReactNode; error?: boolean }) => (
  <footer className="flex w-full items-center justify-end gap-[0.625rem] border-t py-5 border-secondary children:shrink-0">
    {error && (
      <div className="flex grow items-center gap-1.5 text-sans-md text-error">
        <Error12Icon className="shrink-0" />
        <span>Error</span>
      </div>
    )}
    {children}
    {/*
      Close button is here at the end so we aren't automatically focusing on it
      when the side modal is opened. Positioned in the safe area at the top
     */}
    <Dialog.Close
      className="absolute right-[var(--content-gutter)] top-10 -m-2 flex rounded p-2 hover:bg-hover"
      aria-label="Close"
    >
      <Close12Icon className="text-secondary" />
    </Dialog.Close>
  </footer>
)
