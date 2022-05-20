import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Storage24Icon = ({
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
    <g id="24/storage">
      <path
        id="Vector"
        d="M18 2H16V6.1H5V2H2V22H22V7L18 2ZM12 18C9.8 18 8 16.2 8 14C8 11.8 9.8 10 12 10C14.2 10 16 11.8 16 14C16 16.2 14.2 18 12 18Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Storage24Icon
