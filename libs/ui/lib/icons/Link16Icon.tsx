import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Link16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/link">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 4.99999L14 11L10 11L10 13L14 13L16 13L16 11L16 4.99999L16 2.99999L14 2.99999L10 2.99999L10 4.99999L14 4.99999ZM6 4.99999L6 2.99999L2 2.99999L0 2.99999L4.21662e-08 4.99999L1.68665e-07 11L2.10831e-07 13L2 13L6 13L6 11L2 11L2 4.99999L6 4.99999Z"
        fill="#989A9B"
      />
      <rect
        id="Rectangle 262"
        x={11}
        y={6.99998}
        width={2}
        height={6}
        transform="rotate(90 11 6.99998)"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Link16Icon
