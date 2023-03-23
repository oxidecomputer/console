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
        d="M3.00002 5.99999H19L19 7.99998C18.4477 7.99998 18 8.4477 18 8.99998V9.99998C18 10.5523 18.4477 11 19 11L19 13H3.00002V5.99999ZM13 12L10 12L10 6.99998H13L13 12ZM17 12L14 12L14 6.99998H17L17 12ZM7.00002 8.99999L9.00002 8.99999L9.00002 7L7.00002 7V8.99999ZM0 11L2 11L2 9.99998L0 9.99998V11ZM2 8.99999L0 8.99999V7.99999L2 7.99999L2 8.99999ZM0 6.99999L2 6.99999L2 5.99999H0V6.99999ZM2 13L0 13V12L2 12L2 13Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default DiskLargeMiscIcon
