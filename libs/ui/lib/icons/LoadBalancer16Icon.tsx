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
const LoadBalancer16Icon = ({
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
    <g id="16/load-balancer">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.25 0H5.75C5.33579 0 5 0.335786 5 0.75V4.25C5 4.66421 5.33579 5 5.75 5H7V7H2.75C2.33579 7 2 7.33579 2 7.75V8L2 9L2 11H0.75C0.335786 11 0 11.3358 0 11.75V15.25C0 15.6642 0.335786 16 0.75 16H5.25C5.66421 16 6 15.6642 6 15.25V11.75C6 11.3358 5.66421 11 5.25 11H4V9H7H9H12V11H10.75C10.3358 11 10 11.3358 10 11.75V15.25C10 15.6642 10.3358 16 10.75 16H15.25C15.6642 16 16 15.6642 16 15.25V11.75C16 11.3358 15.6642 11 15.25 11H14V9V8V7.75C14 7.33579 13.6642 7 13.25 7H9V5H10.25C10.6642 5 11 4.66421 11 4.25V0.75C11 0.335786 10.6642 0 10.25 0Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default LoadBalancer16Icon
