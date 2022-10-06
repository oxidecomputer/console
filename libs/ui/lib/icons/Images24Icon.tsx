import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Images24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/images">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 12L21.5 6.5L12 1L2.5 6.5L12 12ZM11 13.5L2 8.5V18L11 23V13.5ZM13 23V13.5L22 8.5V18L13 23Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Images24Icon
