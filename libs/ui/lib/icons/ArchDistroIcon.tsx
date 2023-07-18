/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const ArchDistroIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="distro/arch">
      <path
        id="Union"
        d="M7.49856 0C6.83076 1.63712 6.42803 2.70809 5.68458 4.29664C6.1404 4.77981 6.69986 5.34243 7.60852 5.97799C6.6317 5.57598 5.96544 5.17234 5.46737 4.75363C4.51593 6.73904 3.02515 9.56729 0 15.003C2.37776 13.6307 4.2208 12.7839 5.93854 12.4616C5.86478 12.1439 5.82289 11.8008 5.82569 11.4433L5.82849 11.3665C5.86622 9.84355 6.6586 8.67218 7.59732 8.75172C8.53604 8.83125 9.26549 10.1315 9.22757 11.6545C9.22126 11.9416 9.18876 12.217 9.13188 12.4725C10.8309 12.8047 12.6546 13.6488 15 15.003C14.5378 14.1517 14.1243 13.3843 13.7307 12.653C13.1096 12.1718 12.4623 11.5453 11.1406 10.8673C12.0488 11.1038 12.6988 11.3756 13.2062 11.6798C9.19778 4.21665 8.87341 3.22512 7.49847 0.000451393L7.49856 0Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default ArchDistroIcon
