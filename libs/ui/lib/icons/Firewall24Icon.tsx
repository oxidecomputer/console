import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Firewall24Icon = ({
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
    <g id="24/firewall">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 2H11V7H2V2ZM2 17H11V22H2V17ZM7 9H2V15H7V9ZM17 9H22V15H17V9ZM22 2H13V7H22V2ZM13 17H22V22H13V17ZM10.6 15.0909L12 16L13.4 15.0909C14.4 14.4 15 13.2364 15 11.9636V9H12H9V11.9636C9 13.2364 9.6 14.4364 10.6 15.0909Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Firewall24Icon
