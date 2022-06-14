import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Snapshots16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/snapshots">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1.00002L1 4.00002L8 7.00002L15 4.00002L8 1.00002ZM1 6.00002L8 9.00002L15 6.00002V8.00002L8 11L1 8.00002V6.00002ZM8 13L1 10V12L8 15L15 12V10L8 13Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Snapshots16Icon
