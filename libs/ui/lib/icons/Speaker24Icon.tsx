import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Speaker24Icon = ({
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
    <g id="24/speaker">
      <path
        id="Icon"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.723 7C10.9043 7 11.0821 6.95074 11.2375 6.85749L19.4855 1.9087C20.152 1.50878 21 1.98889 21 2.76619V21.2338C21 22.0111 20.152 22.4912 19.4855 22.0913L11.2375 17.1425C11.0821 17.0493 10.9043 17 10.723 17H4C3.44772 17 3 16.5523 3 16V8C3 7.44772 3.44772 7 4 7H10.723Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Speaker24Icon
