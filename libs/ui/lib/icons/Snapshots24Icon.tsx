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
        d="M12 1L1 7L12 13L23 7L12 1ZM12 16L2 10.5455L1 10V11.1391V12L12 18L23 12V11.1391V10L22 10.5455L12 16ZM2 15.5455L12 21L22 15.5455L23 15V16.1391V17L12 23L1 17V16.1391V15L2 15.5455Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Snapshots24Icon
