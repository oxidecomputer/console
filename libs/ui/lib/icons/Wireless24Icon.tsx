import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Wireless24Icon = ({
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
    <g id="24/wireless">
      <path
        id="Vector"
        d="M11.3213 20.2268C11.7171 20.6459 12.3845 20.6443 12.7784 20.2234L22.4763 9.8597C22.7853 9.52949 22.8371 9.03068 22.5783 8.65986C20.1639 5.20113 16.3374 3 12.0516 3C7.76692 3 3.84944 5.20003 1.42451 8.65727C1.16382 9.02894 1.21718 9.52992 1.52892 9.85995L11.3213 20.2268Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Wireless24Icon
