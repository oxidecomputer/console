import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Router24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/router">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 5L12 1L8 5H10V9H14V5H16ZM15 12L19 8V10H23V14H19V16L15 12ZM5 10H1V14H5V16L9 12L5 8V10ZM14 19V15H10V19H8L12 23L16 19H14Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Router24Icon
