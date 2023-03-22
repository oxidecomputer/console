import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Safety24Icon = ({
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
    <g id="24/safety">
      <path
        id="Rectangle 820"
        d="M3 4.72076C3 4.29033 3.27543 3.90819 3.68377 3.77208L11.6838 1.10541C11.889 1.03699 12.111 1.03699 12.3162 1.10541L20.3162 3.77208C20.7246 3.90819 21 4.29033 21 4.72076V13.2928C21 16.1981 19.4249 18.8751 16.8851 20.286L12.4856 22.7302C12.1836 22.898 11.8164 22.898 11.5144 22.7302L7.11486 20.286C4.57514 18.8751 3 16.1981 3 13.2928V4.72076Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Safety24Icon
