import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Logs24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/logs">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 4H6V8H5L5 11H8V10H22V14H8V13H5L5 17H8V16H22V20H8V19H5H4H3L3 8H2V4ZM8 4H22V8H8V4Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Logs24Icon
