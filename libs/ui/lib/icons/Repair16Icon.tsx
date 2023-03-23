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
        d="M6.70263 9.70263C6.1712 9.89507 5.59785 10 5 10C2.23858 10 0 7.76142 0 5C0 4.81184 0.010393 4.62612 0.0306363 4.44336C0.0910931 3.89755 0.743015 3.74302 1.13132 4.13132L3.46967 6.46967C3.76256 6.76256 4.23744 6.76256 4.53033 6.46967L6.46967 4.53033C6.76256 4.23744 6.76256 3.76256 6.46967 3.46967L4.13132 1.13132C3.74302 0.743016 3.89755 0.0910931 4.44336 0.0306363C4.62612 0.010393 4.81184 0 5 0C7.76142 0 10 2.23858 10 5C10 5.59785 9.89507 6.1712 9.70263 6.70262L15.4697 12.4697C15.7626 12.7626 15.7626 13.2374 15.4697 13.5303L13.5303 15.4697C13.2374 15.7626 12.7626 15.7626 12.4697 15.4697L6.70263 9.70263Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Repair16Icon
