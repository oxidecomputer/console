import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const SoftwareUpdate16Icon = ({
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
    <g id="16/software-update">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.00002L8.00001 1.00002L4 5.00002H12ZM1 7.00002H15V15H1V7.00002ZM8.00001 9.00002L12 13H4L8.00001 9.00002Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default SoftwareUpdate16Icon
