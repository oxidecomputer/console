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
      <g id="16/Key">
        <path
          id="Union"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20 2L22.1213 4.12132L20.6213 5.62132L22 7L21 8L19.6213 6.62132L18.1213 8.12132L19.5 9.5L17.5 11.5L16.1213 10.1213L14.0794 12.1633C14.6639 13.1387 15 14.2801 15 15.5C15 19.0899 12.0899 22 8.5 22C4.91015 22 2 19.0899 2 15.5C2 11.9101 4.91015 9 8.5 9C9.78299 9 10.9792 9.37171 11.9867 10.0133L20 2ZM12 15.5C12 17.433 10.433 19 8.5 19C6.567 19 5 17.433 5 15.5C5 13.567 6.567 12 8.5 12C10.433 12 12 13.567 12 15.5Z"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
)

export default Key24Icon
