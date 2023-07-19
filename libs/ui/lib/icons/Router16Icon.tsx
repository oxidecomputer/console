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
const Router16Icon = ({
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
    <g id="16/router">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.2679 3.41434C13.6432 3.71459 13.6432 4.2854 13.2679 4.58565L9.60926 7.51259C9.36372 7.70902 9 7.5342 9 7.21977V6L3.75 6C3.33579 6 3 5.66421 3 5.25L3 2.75C3 2.33579 3.33579 2 3.75 2L9 2V0.780233C9 0.465794 9.36372 0.290979 9.60926 0.487408L13.2679 3.41434ZM2.73207 11.4143C2.35676 11.7146 2.35676 12.2854 2.73207 12.5856L6.39074 15.5126C6.63628 15.709 7 15.5342 7 15.2198V14H12.25C12.6642 14 13 13.6642 13 13.25V10.75C13 10.3358 12.6642 10 12.25 10H7V8.78023C7 8.46579 6.63628 8.29098 6.39074 8.48741L2.73207 11.4143Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Router16Icon
