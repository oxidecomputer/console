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
const Close8Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={8}
    height={8}
    viewBox="0 0 8 8"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="8/close">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.20968 6.91679C6.35613 7.06324 6.59357 7.06324 6.74001 6.91679L6.91679 6.74001C7.06324 6.59357 7.06324 6.35613 6.91679 6.20968L4.70711 4L6.91684 1.79027C7.06328 1.64383 7.06328 1.40639 6.91684 1.25994L6.74006 1.08317C6.59361 0.936721 6.35617 0.936721 6.20973 1.08317L4 3.29289L1.79026 1.08316C1.64382 0.936711 1.40638 0.936711 1.25993 1.08316L1.08316 1.25993C0.936712 1.40638 0.936712 1.64382 1.08316 1.79026L3.29289 4L1.0832 6.20969C0.936757 6.35614 0.936757 6.59358 1.0832 6.74002L1.25998 6.9168C1.40643 7.06324 1.64386 7.06324 1.79031 6.9168L4 4.70711L6.20968 6.91679Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Close8Icon
