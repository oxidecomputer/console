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
const Email24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/email">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.22604 14.9748C5.59296 14.9748 5.11919 14.3939 5.24645 13.7737L6.88292 5.79898C6.97836 5.33387 7.3877 5 7.86251 5H16.1806C16.6571 5 17.0674 5.33621 17.1611 5.80341L18.7601 13.7782C18.8842 14.3971 18.4108 14.9748 17.7796 14.9748H16C15.4477 14.9748 15 15.4225 15 15.9748V17C15 17.5523 14.5523 18 14 18H10C9.44772 18 9 17.5523 9 17V15.9748C9 15.4225 8.55228 14.9748 8 14.9748H6.22604ZM5 3C5.10894 2.50978 5.43532 2 5.9375 2H18C18.5022 2 18.8911 2.50978 19 3L21.9745 14.7423C21.9914 14.8186 22 14.8966 22 14.9748V20.9286C22 21.5203 21.5203 22 20.9286 22H3.07143C2.47969 22 2 21.5203 2 20.9286V14.9748C2 14.8966 2.00856 14.8186 2.02551 14.7423L5 3Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Email24Icon
