import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Loader12Icon = ({
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
    <g id="12/loader">
      <circle id="Overall" cx={6} cy={6} r={5.25} stroke="#1C2225" strokeWidth={1.5} />
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.2498 2.10277C7.75908 1.81949 7.22107 1.63244 6.66457 1.54934C6.30023 1.49494 6 1.20137 6 0.833V0.667C6 0.298626 6.29954 -0.0038323 6.66564 0.0370351C7.48584 0.128594 8.28084 0.388692 8.99973 0.803691C9.91178 1.3302 10.6692 2.08749 11.1958 2.99946C11.7225 3.91142 11.9998 4.94594 12 5.99906C12.0001 6.82913 11.8281 7.64771 11.4974 8.40387C11.3498 8.74139 10.9381 8.84965 10.6191 8.66553L10.4753 8.58256C10.1562 8.39844 10.052 7.99167 10.187 7.64892C10.3932 7.12538 10.5001 6.56591 10.5 5.99929C10.4999 5.20946 10.2919 4.43357 9.89688 3.74959C9.50189 3.06562 8.93383 2.49765 8.2498 2.10277Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Loader12Icon
