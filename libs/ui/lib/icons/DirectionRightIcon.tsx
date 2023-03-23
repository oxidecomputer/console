import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const DirectionRightIcon = ({
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
    <g id="Direction=Right">
      <g id="12/small-arrow">
        <path
          id="\xE2\x96\xB6"
          d="M8.80683 6.59658C9.29845 6.35078 9.29845 5.64922 8.80683 5.40342L2.96529 2.48265C2.5218 2.2609 2 2.58339 2 3.07923V8.92077C2 9.41661 2.5218 9.7391 2.96529 9.51735L8.80683 6.59658Z"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
)
export default DirectionRightIcon
