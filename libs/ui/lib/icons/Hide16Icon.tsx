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
const Hide16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/hide">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.99733 12.0027L2.49999 13.5C2.22384 13.7762 1.77613 13.7762 1.49999 13.5C1.22384 13.2239 1.22384 12.7762 1.49999 12.5L2.78067 11.2193C1.38448 10.1577 0.533257 8.90702 0.184037 8.32648C0.0623522 8.12419 0.0623522 7.87584 0.184037 7.67355C0.852077 6.563 3.35714 3.00001 7.99999 3.00001C8.95618 3.00001 9.82169 3.15114 10.5992 3.40084L12.5 1.50001C12.7761 1.22387 13.2238 1.22387 13.5 1.50001C13.7761 1.77616 13.7761 2.22387 13.5 2.50001L12.0026 3.99736L10.1213 5.87869L5.87867 10.1213L3.99733 12.0027ZM5.12852 8.87148L8.87145 5.12855C8.59566 5.04496 8.30307 5.00001 7.99999 5.00001C6.34313 5.00001 4.99999 6.34316 4.99999 8.00001C4.99999 8.3031 5.04493 8.59569 5.12852 8.87148ZM13.2193 4.7807L10.8715 7.12855C10.955 7.40434 11 7.69693 11 8.00001C11 9.65687 9.65684 11 7.99999 11C7.6969 11 7.40431 10.9551 7.12852 10.8715L5.40081 12.5992C6.17828 12.8489 7.0438 13 7.99999 13C12.6428 13 15.1479 9.43703 15.8159 8.32648C15.9376 8.12419 15.9376 7.87584 15.8159 7.67355C15.4667 7.093 14.6155 5.84228 13.2193 4.7807Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Hide16Icon
