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
const Heart24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/heart">
      <path
        id="Vector"
        d="M12 3.88885C14.2989 1.38731 17.977 1.38731 20.2759 3.88885C22.5747 6.39039 22.5747 10.4929 20.2759 12.9945L12.7404 21.1943C12.3427 21.6271 11.6594 21.6252 11.2641 21.1903L3.72414 12.8944C1.42529 10.3929 1.42529 6.29033 3.72414 3.78879C6.02299 1.38731 9.70115 1.38731 12 3.88885Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Heart24Icon
