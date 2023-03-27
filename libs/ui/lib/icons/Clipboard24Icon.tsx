import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Clipboard24Icon = ({
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
    <g id="24/clipboard">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1C9.44772 1 9 1.44772 9 2V4C9 4.55228 9.44772 5 10 5H14C14.5523 5 15 4.55228 15 4V2C15 1.44772 14.5523 1 14 1H10ZM4 3.00002H7V6.00002C7 6.55231 7.44772 7.00002 8 7.00002H16C16.5523 7.00002 17 6.55231 17 6.00002V3.00002H20C20.5523 3.00002 21 3.44774 21 4.00002V22C21 22.5523 20.5523 23 20 23H4C3.44772 23 3 22.5523 3 22V4.00002C3 3.44774 3.44772 3.00002 4 3.00002Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Clipboard24Icon
