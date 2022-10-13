import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Router16Icon = ({
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
    <g id="16/router">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.99998 0L14 3.99999L8.99998 7.99998V5.99999L2.99999 5.99999L2.99999 2L8.99998 2V0ZM6.99999 7.99998L2 12L6.99999 16V14H13V9.99998H6.99999V7.99998Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Router16Icon
