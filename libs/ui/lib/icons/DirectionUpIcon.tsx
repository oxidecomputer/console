import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const DirectionUpIcon = ({
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
    <g id="Direction=Up">
      <g id="12/small-arrow">
        <path
          id="\xE2\x96\xB6"
          d="M6.59658 3.19317C6.35078 2.70155 5.64922 2.70155 5.40342 3.19317L2.48265 9.03471C2.2609 9.4782 2.58339 10 3.07923 10L8.92077 10C9.41661 10 9.7391 9.4782 9.51735 9.03471L6.59658 3.19317Z"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
)
export default DirectionUpIcon
