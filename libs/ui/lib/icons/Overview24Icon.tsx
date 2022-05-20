import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Overview24Icon = ({
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
    <g id="24/overview">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 2H2V14H11V2ZM22 2H13V8H22V2ZM2 16H11V22H2V16ZM22 10H13V22H22V10Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Overview24Icon
