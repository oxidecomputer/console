import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Security24Icon = ({
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
    <g id="24/security">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 7C15 5.3 13.7 4 12 4C10.3 4 9 5.3 9 7V9H15V7ZM17 9V7C17 4.2 14.8 2 12 2C9.2 2 7 4.2 7 7V9H4V22H20V9H17Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Security24Icon
