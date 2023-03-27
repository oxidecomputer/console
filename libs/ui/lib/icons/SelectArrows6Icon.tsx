import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const SelectArrows6Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={6}
    height={14}
    viewBox="0 0 6 14"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="6/select-arrows">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.32156 0.535946C3.17591 0.293194 2.82409 0.293194 2.67844 0.535946L0.340763 4.43208C0.190794 4.68202 0.370837 5.00001 0.662323 5.00001H5.33768C5.62917 5.00001 5.80921 4.68202 5.65924 4.43208L3.32156 0.535946ZM2.67844 13.4641C2.82409 13.7068 3.17591 13.7068 3.32156 13.4641L5.65924 9.56795C5.80921 9.318 5.62917 9.00001 5.33768 9.00001H0.662323C0.370837 9.00001 0.190795 9.318 0.340763 9.56795L2.67844 13.4641Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default SelectArrows6Icon
