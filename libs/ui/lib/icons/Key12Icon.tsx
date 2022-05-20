import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Key12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/key">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5 0L12 1.5L11.25 2.25L12 3L11 4L10.25 3.25L9.25 4.25L10 5L9 6L8.25 5.25L7.0439 6.4561C7.33472 6.98897 7.5 7.60018 7.5 8.25C7.5 10.3211 5.82107 12 3.75 12C1.67893 12 0 10.3211 0 8.25C0 6.17893 1.67893 4.5 3.75 4.5C4.39982 4.5 5.01103 4.66528 5.5439 4.9561L10.5 0ZM3.75 10C4.7165 10 5.5 9.2165 5.5 8.25C5.5 7.2835 4.7165 6.5 3.75 6.5C2.7835 6.5 2 7.2835 2 8.25C2 9.2165 2.7835 10 3.75 10Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Key12Icon
