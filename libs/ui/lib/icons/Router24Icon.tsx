import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Router24Icon = ({
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
    <g id="24/router">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.9334 5.19992C21.4667 5.59992 21.4667 6.39992 20.9334 6.79993L14.8 11.3999C14.4704 11.6471 14 11.412 14 10.9999V8.99994L5 8.99994C4.44772 8.99994 4 8.55222 4 7.99994L4 3.99994C4 3.44765 4.44772 2.99994 5 2.99994L14 2.99994V0.999931C14 0.587909 14.4704 0.352718 14.8 0.599931L20.9334 5.19992ZM3.06669 17.1999C2.53335 17.5999 2.53335 18.3999 3.06669 18.7999L9.20002 23.3999C9.52964 23.6471 10 23.412 10 22.9999V21H19C19.5523 21 20 20.5523 20 20V16C20 15.4477 19.5523 15 19 15H10V12.9999C10 12.5879 9.52964 12.3527 9.20002 12.5999L3.06669 17.1999Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Router24Icon
