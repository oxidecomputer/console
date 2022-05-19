import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Organization24Icon = ({
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
    <g id="24/organization">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5858 12L5.63603 7.05025L0.686279 12L5.63603 16.9497L10.5858 12ZM23.3137 12L18.3639 7.05025L13.4142 12L18.3639 16.9497L23.3137 12ZM12 0.686302L16.9497 5.63605L12 10.5858L7.05023 5.63605L12 0.686302ZM16.9497 18.364L12 13.4142L7.05024 18.364L12 23.3137L16.9497 18.364Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Organization24Icon
