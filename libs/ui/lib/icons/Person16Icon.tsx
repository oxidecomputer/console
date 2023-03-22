import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Person16Icon = ({
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
    <g id="16/person">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5C12 7.20914 10.2091 9 8 9C5.79086 9 4 7.20914 4 5C4 2.79086 5.79086 1 8 1C10.2091 1 12 2.79086 12 5ZM1 14.3684C1 12.5081 2.50809 11 4.36842 11H11.6316C13.4919 11 15 12.5081 15 14.3684C15 14.7172 14.7172 15 14.3684 15H1.63158C1.28277 15 1 14.7172 1 14.3684Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Person16Icon
