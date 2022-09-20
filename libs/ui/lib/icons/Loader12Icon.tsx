import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Loader12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="12/loader">
      <circle id="Overall" cx={6} cy={6} r={5.25} stroke="#1C2225" strokeWidth={1.5} />
      <path
        id="Progress"
        d="M6 0.75C6.92147 0.75 7.82672 0.992534 8.62476 1.45323C9.42281 1.91392 10.0855 2.57655 10.5464 3.37452C11.0072 4.1725 11.2499 5.0777 11.25 5.99918C11.2501 6.92065 11.0078 7.82593 10.5472 8.62405"
        stroke="#B8BBBC"
        strokeWidth={1.5}
      />
    </g>
  </svg>
)

export default Loader12Icon
