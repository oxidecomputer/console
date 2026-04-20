/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Outlet } from 'react-router'

import heroRackImg from '~/assets/oxide-hero-rack.webp'
import { OxideLogo } from '~/components/OxideLogo'

export default function LoginLayout() {
  return (
    <main className="layout relative flex h-screen">
      <div className="hero-bg text-accent max-800:hidden relative flex w-1/2 justify-end">
        <div className="hero-rack-wrapper">
          <img src={heroRackImg} alt="A populated Oxide rack" className="hero-rack" />
        </div>
      </div>
      <div className="max-800:w-full max-800:justify-center z-10 flex h-full w-1/2 justify-start">
        <div className="600:pr-10 flex h-full w-full max-w-[480px] items-center justify-center">
          <div className="flex w-[320px] flex-col items-center">
            <Outlet />
          </div>
        </div>
      </div>
      <OxideLogo className="max-800:block absolute bottom-8 left-1/2 hidden -translate-x-1/2" />
    </main>
  )
}
