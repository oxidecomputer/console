import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Progress24Icon = ({
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
    <g id="24/progress">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1L6 7H18L12 1ZM6 15L12 9L18 15H6ZM6 23L12 17L18 23H6Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Progress24Icon
