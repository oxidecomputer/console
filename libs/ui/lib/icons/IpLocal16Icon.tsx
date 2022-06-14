import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const IpLocal16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/ip-local">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 7.00002C9.65685 7.00002 11 5.65688 11 4.00002C11 2.34317 9.65685 1.00002 8 1.00002C6.34315 1.00002 5 2.34317 5 4.00002C5 5.00307 5.49227 5.89115 6.24839 6.43584L4.71803 9.08649C4.48797 9.02999 4.24749 9.00002 4 9.00002C2.34315 9.00002 1 10.3432 1 12C1 13.6569 2.34315 15 4 15C5.65685 15 7 13.6569 7 12C7 11.1303 6.62992 10.3471 6.03865 9.79911L7.66536 6.98157C7.77523 6.99376 7.88688 7.00002 8 7.00002ZM15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3432 10.3431 9.00002 12 9.00002C13.6569 9.00002 15 10.3432 15 12Z"
        fill="#989A9B"
      />
      <path
        id="Rectangle 61"
        d="M12.527 10.475L11.228 11.225L8.5 6.49999L9.79904 5.74999L12.527 10.475Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default IpLocal16Icon
