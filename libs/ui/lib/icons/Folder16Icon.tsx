import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Folder16Icon = ({
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
    <g id="16/folder">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 2H9.27273V3.90909H1V2ZM1 5H15V14H1V5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Folder16Icon
