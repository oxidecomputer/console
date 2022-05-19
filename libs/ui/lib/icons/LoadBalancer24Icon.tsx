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
    fill="none"
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
        d="M15 2H9V7H11V10H3V11V12V17H1V22H7V17H5V12H11V17H9V22H15V17H13V12H19V17H17V22H23V17H21V12V11V10H13V7H15V2Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default LoadBalancer24Icon
