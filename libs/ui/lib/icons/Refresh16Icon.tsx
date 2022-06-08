import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Refresh16Icon = ({
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
    <g id="16/refresh">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.80608 4.18234C7.60748 3.93171 8.46744 3.93964 9.26408 4.20499C10.0607 4.47035 10.7537 4.97968 11.2447 5.66081C11.5373 6.06665 11.7494 6.52123 11.873 7H10L13 10L16 7H13.9161C13.7638 6.09883 13.4067 5.23976 12.8671 4.49121C12.1305 3.46951 11.0911 2.70552 9.89613 2.30749C8.70115 1.90945 7.41123 1.89756 6.20912 2.2735C5.28001 2.56407 4.43978 3.07493 3.75735 3.75735L5.17157 5.17157C5.62652 4.71662 6.18667 4.37605 6.80608 4.18234ZM3 6L0 9H2.08391C2.23631 9.90157 2.5936 10.761 3.13364 11.5098C3.87065 12.5317 4.91064 13.2956 6.10617 13.6933C7.30169 14.091 8.59207 14.1022 9.79434 13.7254C10.7221 13.4346 11.5611 12.9242 12.2426 12.2426L10.8284 10.8284C10.3741 11.2828 9.81474 11.6231 9.19623 11.8169C8.39471 12.0681 7.53446 12.0606 6.73744 11.7955C5.94043 11.5304 5.2471 11.0211 4.75576 10.3398C4.46293 9.93384 4.25071 9.47903 4.12702 9H6L3 6Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Refresh16Icon
