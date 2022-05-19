import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Person24Icon = ({
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
    <g id="24/person">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 5C16 7.20914 14.2091 9 12 9C9.79086 9 8 7.20914 8 5C8 2.79086 9.79086 1 12 1C14.2091 1 16 2.79086 16 5ZM7 23V11H17V23H7Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Person24Icon
