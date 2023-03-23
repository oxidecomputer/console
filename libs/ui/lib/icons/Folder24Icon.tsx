import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Folder24Icon = ({
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
    <g id="24/folder">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 3H12C12.5523 3 13 3.44772 13 4V6H1V4C1 3.44772 1.44772 3 2 3ZM1 8H22C22.5523 8 23 8.44772 23 9V20C23 20.5523 22.5523 21 22 21H2C1.44772 21 1 20.5523 1 20V8Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Folder24Icon
