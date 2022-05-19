import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Metrics16Icon = ({
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
    <g id="16/metrics">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1C12.3137 1 15 3.68629 15 7H9V1ZM1 9C1 5.68629 3.68629 3 7 3V9H13C13 12.3137 10.3137 15 7 15C3.68629 15 1 12.3137 1 9Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Metrics16Icon
