import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const AddRoundel12Icon = ({
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
    <g id="12/add-roundel">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12C9.31371 12 12 9.3137 12 5.99999C12 2.68628 9.31371 -9.30369e-06 6 -9.26154e-06C2.68629 -9.30369e-06 -4.75098e-08 2.68628 2.05371e-07 5.99999C3.73959e-07 9.3137 2.68629 12 6 12ZM6.75 2.5L6.75 5.25H9.5V6.75H6.75L6.75 9.5L5.25 9.5V6.75H2.5L2.5 5.25L5.25 5.25V2.5L6.75 2.5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default AddRoundel12Icon
