import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Cpu24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/cpu">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 6L11 6L11 2L13 2L13 6ZM22 9V7H18V9H22ZM17 7H7V17H17V7ZM22 13V11H18V13H22ZM22 15V17H18V15H22ZM6 11V13H2V11H6ZM6 17V15H2V17H6ZM6 7V9H2V7H6ZM11 22H13L13 18H11L11 22ZM9 22H7L7 18H9L9 22ZM15 22H17L17 18H15L15 22ZM7 6L9 6L9 2L7 2L7 6ZM17 6L15 6L15 2L17 2L17 6Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Cpu24Icon
