import { Outlet } from 'react-router-dom'

import heroRackImg from 'app/assets/oxide-hero-rack.webp'
import { OxideLogo } from 'app/components/OxideLogo'

export function LoginLayout() {
  return (
    <main className="layout relative flex h-screen">
      <div className="hero-bg relative flex w-1/2 justify-end text-accent sm-:hidden">
        <div className="hero-rack-wrapper">
          <img src={heroRackImg} alt="A populated Oxide rack" className="hero-rack" />
        </div>
      </div>
      <div className="z-10 flex h-full w-1/2 justify-start sm-:w-full sm-:justify-center">
        <div className="flex h-full w-full max-w-[480px] items-center justify-center sm+:pr-10">
          <div className="flex w-[320px] flex-col items-center">
            <Outlet />
          </div>
        </div>
      </div>
      <OxideLogo className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm-:block" />
    </main>
  )
}
