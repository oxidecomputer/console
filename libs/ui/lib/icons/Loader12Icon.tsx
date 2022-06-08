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
      <circle id="Overall" cx={6} cy={6} r={5.25} stroke="#292F31" strokeWidth={1.5} />
      <path
        id="Progress"
        d="M6 0.75C6.92336 0.75 7.8304 0.993529 8.62959 1.45602C9.42878 1.91851 10.0919 2.58359 10.5519 3.38418C11.012 4.18477 11.2528 5.09253 11.25 6.01589C11.2472 6.93925 11.0009 7.84554 10.536 8.64333"
        stroke="#989A9B"
        strokeWidth={1.5}
      />
    </g>
  </svg>
)

export default Loader12Icon
