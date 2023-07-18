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
const Question12Icon = ({
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
    <g id="12/question">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM4.98161 3.96049C4.91915 4.05523 4.87213 4.15829 4.83736 4.25978C4.74788 4.52102 4.5261 4.75 4.24996 4.75H3.74996C3.47382 4.75 3.24791 4.52482 3.29549 4.25281C3.35453 3.91523 3.48085 3.51171 3.72925 3.1349C4.15138 2.49455 4.88519 2 5.99996 2C7.04092 2 7.7701 2.35496 8.2225 2.90213C8.64963 3.41872 8.74996 4.01045 8.74996 4.36846C8.74996 4.96633 8.5677 5.43236 8.22777 5.78546C7.9602 6.06341 7.61823 6.23496 7.40192 6.34348L7.34041 6.37449C7.08665 6.50377 6.96983 6.57959 6.89286 6.67363C6.86459 6.70818 6.8282 6.76202 6.79922 6.85445C6.73312 7.06525 6.57087 7.25 6.34996 7.25H5.91996C5.54993 7.25 5.23742 6.94578 5.31967 6.58501C5.39571 6.25141 5.53368 5.96602 5.73205 5.72362C6.03008 5.35946 6.41326 5.16339 6.65951 5.03794C6.95155 4.88916 7.06676 4.82866 7.14714 4.74515C7.18222 4.70872 7.24996 4.63324 7.24996 4.36846C7.24996 4.24863 7.20966 4.03114 7.06647 3.85795C6.94857 3.71535 6.67775 3.5 5.99996 3.5C5.39598 3.5 5.12979 3.7357 4.98161 3.96049ZM5.12496 8.92C5.12496 8.54997 5.42493 8.25 5.79496 8.25H6.20496C6.57499 8.25 6.87496 8.54997 6.87496 8.92V9.33C6.87496 9.70003 6.57499 10 6.20496 10H5.79496C5.42493 10 5.12496 9.70003 5.12496 9.33V8.92Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Question12Icon
