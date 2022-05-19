import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Document24Icon = ({
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
    <g id="24/document">
      <path
        id="Vector"
        d="M16 1H4V23H20V5L16 1ZM6 11H15V13H6V11ZM17 17H6V15H17V17ZM18 9H6V7H18V9Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Document24Icon
