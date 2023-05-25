import cn from 'classnames'
import { Outlet } from 'react-router-dom'

import { Checkmark12Icon } from '@oxide/ui'

import { TopBarControls } from 'app/components/TopBar'

export function OnboardingLayout() {
  return (
    <div className="h-screen">
      <div className="flex h-[60px] items-center justify-between border-b px-3 border-secondary">
        <div className="text-sans-2xl text-accent">Oxide</div>
        <TopBarControls />
      </div>
      {/* IMPORTANT: We have patched React Router's <ScrollRestoration> to use this 
          container instead of window as the scroll container. This exact ID has to
          be on this element for that to work. */}
      <div id="content-pane" className="flex h-full overflow-auto pt-16">
        <div className="flex flex-grow justify-center">
          <main className="mx-4 mb-4 max-w-2xl">
            <Outlet />
          </main>
        </div>
        <div className="w-80 space-y-6">
          <Step num={1}>Create a silo</Step>
          <Step num={2}>Configure identity provider</Step>
          <Step num={3}>Test IdP configuration</Step>
          <Step num={4}>Configure admin group</Step>
          <Step num={5}>Review</Step>
        </div>
      </div>
    </div>
  )
}

type StepProps = {
  num: number
  children: React.ReactNode
}

function Step({ children, num }: StepProps) {
  const status = 'ready' as string
  return (
    <div className="flex items-center">
      <div
        className={cn(
          'mr-6 flex h-10 w-10 items-center justify-center rounded-full border text-sans-semi-lg',
          {
            'text-disabled border-default': status === 'ready',
            'text-accent border-accent': status === 'running',
            'text-quaternary bg-raise-hover': status === 'complete',
          }
        )}
      >
        {status === 'complete' ? <Checkmark12Icon className="h-4 w-4" /> : num}
      </div>
      <div
        className={cn('text-sans-lg', {
          'text-secondary': status === 'ready',
          'text-accent': status === 'running',
          'text-default': status === 'complete',
        })}
      >
        {children}
      </div>
    </div>
  )
}
