import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Access24Icon = ({
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
    <g id="24/access">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 4.72076C3 4.29033 3.27543 3.90819 3.68377 3.77208L11.6838 1.10541C11.889 1.03699 12.111 1.03699 12.3162 1.10541L20.3162 3.77208C20.7246 3.90819 21 4.29033 21 4.72076V13.2928C21 16.1981 19.4249 18.8751 16.8851 20.286L12.4856 22.7302C12.1836 22.898 11.8164 22.898 11.5144 22.7302L7.11486 20.286C4.57514 18.8751 3 16.1981 3 13.2928V4.72076ZM7 15C7 13.3431 8.34315 12 10 12H14C15.6569 12 17 13.3431 17 15V16.4338C17 16.7851 16.8157 17.1106 16.5145 17.2913L12.5145 19.6913C12.1978 19.8813 11.8022 19.8813 11.4855 19.6913L7.4855 17.2913C7.1843 17.1106 7 16.7851 7 16.4338V15ZM12 10C13.6569 10 15 8.65685 15 7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7C9 8.65685 10.3431 10 12 10Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Access24Icon
