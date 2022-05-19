import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Folder24Icon = ({
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
    <g id="24/folder">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 3H14V6H1V3ZM1 8H23V21H1V8Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Folder24Icon
