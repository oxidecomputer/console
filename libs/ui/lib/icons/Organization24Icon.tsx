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
const Organization24Icon = ({
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
    <g id="24/organization">
      <g id="Union">
        <path
          d="M9.91789 12.7071C10.3084 12.3166 10.3084 11.6834 9.91789 11.2929L6.51961 7.8946C6.12908 7.50407 5.49592 7.50407 5.10539 7.8946L1.70711 11.2929C1.31658 11.6834 1.31658 12.3166 1.70711 12.7071L5.10539 16.1054C5.49592 16.4959 6.12908 16.4959 6.51961 16.1054L9.91789 12.7071Z"
          fill="currentColor"
        />
        <path
          d="M22.2929 12.7071C22.6834 12.3166 22.6834 11.6834 22.2929 11.2929L18.8946 7.89461C18.5041 7.50408 17.8709 7.50408 17.4804 7.89461L14.0821 11.2929C13.6916 11.6834 13.6916 12.3166 14.0821 12.7071L17.4804 16.1054C17.8709 16.4959 18.5041 16.4959 18.8946 16.1054L22.2929 12.7071Z"
          fill="currentColor"
        />
        <path
          d="M11.2929 1.70711C11.6834 1.31658 12.3166 1.31658 12.7071 1.70711L16.1054 5.10539C16.4959 5.49592 16.4959 6.12908 16.1054 6.51961L12.7071 9.91789C12.3166 10.3084 11.6834 10.3084 11.2929 9.91789L7.8946 6.51961C7.50407 6.12908 7.50407 5.49592 7.8946 5.10539L11.2929 1.70711Z"
          fill="currentColor"
        />
        <path
          d="M16.1054 18.8946C16.4959 18.5041 16.4959 17.8709 16.1054 17.4804L12.7071 14.0821C12.3166 13.6916 11.6834 13.6916 11.2929 14.0821L7.89458 17.4804C7.50405 17.8709 7.50405 18.5041 7.89458 18.8946L11.2929 22.2929C11.6834 22.6834 12.3166 22.6834 12.7071 22.2929L16.1054 18.8946Z"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
)
export default Organization24Icon
