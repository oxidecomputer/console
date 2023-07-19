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
const Images24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/images">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.499 11.7099C11.8089 11.8894 12.1911 11.8894 12.501 11.7099L20.7526 6.93271C21.0852 6.74013 21.0852 6.25987 20.7526 6.06729L12.501 1.29007C12.1911 1.11064 11.8089 1.11064 11.4989 1.29007L3.24741 6.06729C2.91477 6.25987 2.91477 6.74013 3.24741 6.93271L11.499 11.7099ZM11 14.0884C11 13.7252 10.8031 13.3906 10.4856 13.2142L2.74282 8.91268C2.40956 8.72753 2 8.96852 2 9.34976V17.4116C2 17.7748 2.19689 18.1094 2.51436 18.2858L10.2572 22.5873C10.5904 22.7725 11 22.5315 11 22.1502V14.0884ZM13 14.0884C13 13.7252 13.1969 13.3906 13.5144 13.2142L21.2572 8.91268C21.5904 8.72753 22 8.96852 22 9.34976V17.4116C22 17.7748 21.8031 18.1094 21.4856 18.2858L13.7428 22.5873C13.4096 22.7725 13 22.5315 13 22.1502V14.0884Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Images24Icon
