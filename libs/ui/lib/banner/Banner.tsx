/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import './banner.css'

interface BannerProps {
  children: React.ReactNode
}

export const Banner = ({ children }: BannerProps) => {
  return (
    <label className="ox-banner absolute flex h-10 w-full items-center justify-center text-sans-md text-info-secondary bg-info-secondary">
      {children}
    </label>
  )
}
