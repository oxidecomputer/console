import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const IpLocal16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/ip-local">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.73616 6.90901C8.50062 6.96843 8.254 7 8 7C7.88688 7 7.77523 6.99374 7.66536 6.98155L6.03865 9.79909C6.62992 10.347 7 11.1303 7 12C7 13.6569 5.65685 15 4 15C2.34315 15 1 13.6569 1 12C1 10.3431 2.34315 9 4 9C4.24749 9 4.48797 9.02997 4.71803 9.08647L6.24839 6.43581C5.49227 5.89112 5 5.00305 5 4C5 2.34315 6.34315 1 8 1C9.65685 1 11 2.34315 11 4C11 4.86307 10.6355 5.64102 10.0521 6.18834L11.6849 9.01635C11.7884 9.00554 11.8936 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.9905 9.49864 10.0974 10.2631 9.55368L8.73616 6.90901Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default IpLocal16Icon
