import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Show16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/show">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.184037 7.67353C0.852077 6.56298 3.35714 3 7.99999 3C12.6428 3 15.1479 6.56298 15.8159 7.67353C15.9376 7.87582 15.9376 8.12418 15.8159 8.32647C15.1479 9.43702 12.6428 13 7.99999 13C3.35714 13 0.852077 9.43702 0.184037 8.32647C0.0623522 8.12418 0.0623522 7.87582 0.184037 7.67353ZM7.99999 11C9.65684 11 11 9.65685 11 8C11 6.34315 9.65684 5 7.99999 5C6.34313 5 4.99999 6.34315 4.99999 8C4.99999 9.65685 6.34313 11 7.99999 11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Show16Icon
