import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Warning12Icon = ({
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
    <g id="12/warning">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0L12 12H0L6 0ZM5.25 4.00001H6.75V8.00001H5.25V4.00001ZM5.25 9.00001H6.75V10.5H5.25V9.00001Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Warning12Icon
