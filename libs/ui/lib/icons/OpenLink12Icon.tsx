import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const OpenLink12Icon = ({
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
    <g id="12/open-link">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.667 1H5.0201L6.01005 1.98995L6.0201 2H2V10H10V5.9799L10.0101 5.98995L11 6.9799V10.333C11 10.7014 10.7014 11 10.333 11H1.667C1.29863 11 1 10.7014 1 10.333V1.667C1 1.29863 1.29863 1 1.667 1ZM10 3.96906V4L11 5V3.38972V3.0201V2.4V1.667C11 1.29863 10.7014 1 10.333 1H9.6H8.9799H8.61028H7L8 2H8.03094C8.05949 2.04865 8.09523 2.09523 8.13864 2.13864L9.86136 3.86136C9.90476 3.90476 9.95135 3.94051 10 3.96906Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default OpenLink12Icon
