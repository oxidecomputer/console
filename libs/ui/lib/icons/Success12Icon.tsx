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
const Success12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/success">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM9.11127 4.9975C9.3577 4.72369 9.3355 4.30195 9.06169 4.05552L8.93831 3.94448C8.6645 3.69805 8.24276 3.72024 7.99633 3.99405L5.3586 6.92486L4.00024 5.63118C3.73349 5.37713 3.31129 5.38743 3.05724 5.65418L2.94276 5.77439C2.68871 6.04114 2.699 6.46334 2.96576 6.71739L4.94458 8.60198C5.21667 8.86111 5.649 8.84447 5.90036 8.56518L9.11127 4.9975Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Success12Icon
