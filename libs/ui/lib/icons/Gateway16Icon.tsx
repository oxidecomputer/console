import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Gateway16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/gateway">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 0H13V16H3V0ZM11 2L6 4.25V11.5644L11 14V2Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Gateway16Icon
