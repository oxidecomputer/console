import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Firewall16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/firewall">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 3.05175e-05H6.99999V3.00002H0V3.05175e-05ZM0 13H6.99999V16H0V13ZM16 13H8.99998V16H16V13ZM0 5.00002H2.99999V11H0V5.00002ZM16 5.00002H13V11H16V5.00002ZM8.99998 3.05175e-05H16V3.00002H8.99998V3.05175e-05ZM6.59999 11.0909L7.99998 12L9.39998 11.0909C10.4 10.4 11 9.23638 11 7.96365V5.00002H7.99998H4.99999V7.96365C4.99999 9.23638 5.59999 10.4364 6.59999 11.0909Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Firewall16Icon
