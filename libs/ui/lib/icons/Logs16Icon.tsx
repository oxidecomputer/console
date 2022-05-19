import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Logs16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/logs">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 3H0V7H4V3ZM16 3H6V7H16V3ZM6 9H16V13H6V9ZM1 12H3L3 7.00002H1L1 12Z"
        fill="#989A9B"
      />
      <path
        id="Rectangle 64"
        d="M6 9.99999L1 9.99999L1 12L6 12L6 9.99999Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Logs16Icon
