import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const DiskSmallMiscIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={15}
    height={15}
    viewBox="0 0 15 15"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="misc/disk-small">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 5H2.00001V10H15V8.00001L14 8.00001V7.00001L15 7.00001V5ZM7.00001 6.99999L6.00001 6.99999V5.99999H7.00001L7.00001 6.99999ZM8.00001 9.00001L10 9.00001L10 6.00001L8.00001 6.00001L8.00001 9.00001ZM11 9.00001L13 9.00001L13 6.00001L11 6.00001L11 9.00001ZM1 8L0 8V7L1 7L1 8ZM0 6L1 6L1 5H0V6ZM1 10H0V9H1L1 10Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default DiskSmallMiscIcon
