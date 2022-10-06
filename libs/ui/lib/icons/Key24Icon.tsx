import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Key24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/key">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.88 2L21.0013 4.12132L20.0613 5.06132L22 7L20.5858 8.41421L18.6471 6.47553L17.1826 7.94001L19.1213 9.87868L17 12L15.0613 10.0613L13.6233 11.4993C14.4859 12.6024 15 13.9912 15 15.5C15 19.0899 12.0899 22 8.5 22C4.91015 22 2 19.0899 2 15.5C2 11.9101 4.91015 9 8.5 9C9.48858 9 10.4256 9.22069 11.2645 9.61549L18.88 2ZM8.5 19C10.433 19 12 17.433 12 15.5C12 13.567 10.433 12 8.5 12C6.567 12 5 13.567 5 15.5C5 17.433 6.567 19 8.5 19Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Key24Icon
