import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Hide16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/hide">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.99733 12.0027L2.49999 13.5C2.22384 13.7761 1.77613 13.7761 1.49999 13.5C1.22384 13.2239 1.22384 12.7761 1.49999 12.5L2.78067 11.2193C1.38448 10.1577 0.533257 8.90701 0.184037 8.32647C0.0623522 8.12418 0.0623522 7.87582 0.184037 7.67353C0.852077 6.56298 3.35714 3 7.99999 3C8.95618 3 9.82169 3.15112 10.5992 3.40082L12.5 1.5C12.7761 1.22386 13.2238 1.22386 13.5 1.5C13.7761 1.77614 13.7761 2.22386 13.5 2.5L12.0026 3.99734L10.1213 5.87868L5.87867 10.1213L3.99733 12.0027ZM5.12852 8.87146L8.87145 5.12853C8.59566 5.04494 8.30307 5 7.99999 5C6.34313 5 4.99999 6.34314 4.99999 8C4.99999 8.30309 5.04493 8.59567 5.12852 8.87146ZM13.2193 4.78069L10.8715 7.12853C10.955 7.40432 11 7.69691 11 8C11 9.65685 9.65684 11 7.99999 11C7.6969 11 7.40431 10.9551 7.12852 10.8715L5.40081 12.5992C6.17828 12.8489 7.0438 13 7.99999 13C12.6428 13 15.1479 9.43702 15.8159 8.32647C15.9376 8.12418 15.9376 7.87582 15.8159 7.67353C15.4667 7.09299 14.6155 5.84227 13.2193 4.78069Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Hide16Icon
