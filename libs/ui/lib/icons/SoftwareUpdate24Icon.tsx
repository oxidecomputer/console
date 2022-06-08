import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const SoftwareUpdate24Icon = ({
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
    <g id="24/software-update">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2L16 6H8L12 2ZM22 8H2V16H22V8ZM16 14L12 10L8 14H16ZM16 22L12 18L8 22H16Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default SoftwareUpdate24Icon
