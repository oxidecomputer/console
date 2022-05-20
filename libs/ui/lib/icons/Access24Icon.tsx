import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Access24Icon = ({
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
    <g id="24/access">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 4L12 1L21 4V12.1833C21 15.1925 19.4961 18.0026 16.9923 19.6718L16 20.3333L12 23L8 20.3333L7.0077 19.6718C4.50391 18.0026 3 15.1925 3 12.1833V4ZM8 12V17.9279C8.03871 17.9549 8.07775 17.9815 8.1171 18.0077L12 20.5963L15.8829 18.0077C15.9223 17.9815 15.9613 17.9549 16 17.9279V12H8ZM15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Access24Icon
