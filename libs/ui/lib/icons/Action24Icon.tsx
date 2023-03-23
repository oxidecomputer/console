import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Action24Icon = ({
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
    <g id="24/action">
      <path
        id="Vector"
        d="M14 11H19.8634C20.2984 11 20.5259 11.5172 20.232 11.8379L10.8686 22.0525C10.5604 22.3886 10 22.1706 10 21.7146V13H4.13662C3.70157 13 3.47406 12.4828 3.76804 12.1621L13.1314 1.94754C13.4396 1.61139 14 1.8294 14 2.2854V11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Action24Icon
