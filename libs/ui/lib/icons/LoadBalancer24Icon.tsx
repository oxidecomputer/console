import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const LoadBalancer24Icon = ({
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
    <g id="24/load-balancer">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 2H9V8H11V12H5H3V14V18H2V22H6V18H5V14H11V18H10V22H14V18H13V14H19V18H18V22H22V18H21V14V12H19H13V8H15V2Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default LoadBalancer24Icon
