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
    fill="none"
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
        d="M12 11.9L22 6.4L12 1L2 6.4L12 11.9ZM11 13.6L1 8.10001V18L11 23.5V13.6ZM13 23.5V13.6L23 8.10001V18L13 23.5Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Images24Icon
