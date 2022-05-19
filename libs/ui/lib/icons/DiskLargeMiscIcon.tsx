import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const DiskLargeMiscIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={19}
    height={19}
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="misc/disk-large">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.00002 6H19L19 7.99999C18.4477 7.99999 18 8.44771 18 8.99999V9.99998C18 10.5523 18.4477 11 19 11L19 13H3.00002V6ZM13 12L10 12L10 6.99999H13L13 12ZM17 12L14 12L14 6.99999H17L17 12ZM7.00002 9L9.00002 9L9.00002 7L7.00002 7V9ZM0 11L2 11L2 9.99999L0 9.99999V11ZM2 8.99999L0 8.99999V7.99999L2 8L2 8.99999ZM0 7L2 7L2 6H0V7ZM2 13L0 13V12L2 12L2 13Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default DiskLargeMiscIcon
