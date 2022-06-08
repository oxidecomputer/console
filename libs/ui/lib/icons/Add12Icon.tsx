import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Add12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="12/add">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 5.5L6.5 0H5.5L5.5 5.5L0 5.5V6.5L5.5 6.5L5.5 12H6.5L6.5 6.5L12 6.5V5.5L6.5 5.5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Add12Icon
