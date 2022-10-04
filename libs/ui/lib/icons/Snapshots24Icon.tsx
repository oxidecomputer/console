import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Snapshots24Icon = ({
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
    <g id="24/snapshots">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1L2 7L12 13L22 7L12 1ZM12 16L3 10.6L2 10V11.1662V12L12 18L22 12V11.1662V10L21 10.6L12 16ZM3 15.6L12 21L21 15.6L22 15V16.1662V17L12 23L2 17V16.1662V15L3 15.6Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Snapshots24Icon
