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
        d="M8.73616 6.90903C8.50062 6.96845 8.254 7.00002 8 7.00002C7.88688 7.00002 7.77523 6.99376 7.66536 6.98156L6.03865 9.79911C6.62992 10.3471 7 11.1303 7 12C7 13.6569 5.65685 15 4 15C2.34315 15 1 13.6569 1 12C1 10.3432 2.34315 9.00002 4 9.00002C4.24749 9.00002 4.48797 9.02999 4.71803 9.08649L6.24839 6.43583C5.49227 5.89114 5 5.00307 5 4.00002C5 2.34316 6.34315 1.00002 8 1.00002C9.65685 1.00002 11 2.34316 11 4.00002C11 4.86309 10.6355 5.64104 10.0521 6.18836L11.6849 9.01637C11.7884 9.00556 11.8936 9.00002 12 9.00002C13.6569 9.00002 15 10.3432 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.9905 9.49864 10.0974 10.2631 9.5537L8.73616 6.90903Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default IpLocal16Icon
