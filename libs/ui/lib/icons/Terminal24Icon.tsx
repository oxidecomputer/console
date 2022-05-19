import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Terminal24Icon = ({
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
    <g id="24/terminal">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 13.1385V16L11 11.2923V8.70769L0 4V6.86154L7.88333 10L0 13.1385ZM11 19H24V21H11V19Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Terminal24Icon
