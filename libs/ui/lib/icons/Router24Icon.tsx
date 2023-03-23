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
        d="M20.9334 5.19999C21.4667 5.59999 21.4667 6.39999 20.9334 6.79999L14.8 11.4C14.4704 11.6472 14 11.412 14 11V9L5 9C4.44772 9 4 8.55228 4 8L4 4C4 3.44772 4.44772 3 5 3L14 3V0.999992C14 0.58797 14.4704 0.352779 14.8 0.599992L20.9334 5.19999ZM3.06669 17.2C2.53335 17.6 2.53335 18.4 3.06669 18.8L9.20002 23.4C9.52964 23.6472 10 23.412 10 23V21.0001H19C19.5523 21.0001 20 20.5523 20 20.0001V16.0001C20 15.4478 19.5523 15.0001 19 15.0001H10V13C10 12.588 9.52964 12.3528 9.20002 12.6L3.06669 17.2Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Router24Icon
