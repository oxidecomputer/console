import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Instances16Icon = ({
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
    <g id="16/instances">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 3V1H15V10H13V3H6ZM1 15V5H11V15H1Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Instances16Icon
