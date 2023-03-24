import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Gateway16Icon = ({
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
    <g id="16/gateway">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.75 0H13.25C13.6642 0 14 0.335786 14 0.75V15.25C14 15.6642 13.6642 16 13.25 16H2.75C2.33579 16 2 15.6642 2 15.25V0.75C2 0.335786 2.33579 0 2.75 0ZM6.22111 4.1505C6.08654 4.21106 6 4.3449 6 4.49247V11.3299C6 11.4734 6.08182 11.6042 6.21078 11.667L10.4608 13.7373C10.7099 13.8587 11 13.6773 11 13.4002V2.57997C11 2.30785 10.7193 2.12633 10.4711 2.238L6.22111 4.1505Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Gateway16Icon
