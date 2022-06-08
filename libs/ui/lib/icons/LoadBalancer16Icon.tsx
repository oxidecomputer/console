import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const LoadBalancer16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/load-balancer">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 0H5V5H7V7H2V8L2 9L2 11H0V16H6V11H4V9H7H9H12V11H10V16H16V11H14V9V8V7H9V5H11V0Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default LoadBalancer16Icon
