import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Resize16Icon = ({
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
    <g id="16/resize">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 0V2L14 2V5H16V2V0H14H11ZM0 11H2L2 14L5 14L5 16H2H0V14V11ZM4 4H12V12H4V4Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Resize16Icon
