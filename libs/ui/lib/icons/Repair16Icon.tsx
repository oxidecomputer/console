import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Repair16Icon = ({
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
    <g id="16/repair">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.70263 9.70263C6.1712 9.89507 5.59785 10 5 10C2.23858 10 0 7.76142 0 5C0 4.40215 0.104929 3.8288 0.297375 3.29737L4 7L7 4L3.29737 0.297375C3.8288 0.104929 4.40215 0 5 0C7.76142 0 10 2.23858 10 5C10 5.59785 9.89507 6.1712 9.70263 6.70263L16 13L13 16L6.70263 9.70263Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Repair16Icon
