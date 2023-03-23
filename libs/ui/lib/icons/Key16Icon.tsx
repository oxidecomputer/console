import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Key16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/key">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5303 0.53033L15.4697 1.46967C15.7626 1.76256 15.7626 2.23744 15.4697 2.53033L15 3L15.5 3.5C15.7761 3.77614 15.7761 4.22386 15.5 4.5C15.2239 4.77614 14.7761 4.77614 14.5 4.5L14 4L13 5L13.4697 5.46967C13.7626 5.76256 13.7626 6.23744 13.4697 6.53033L12.5303 7.46967C12.2374 7.76256 11.7626 7.76256 11.4697 7.46967L11 7L9.39186 8.60814C9.77962 9.31862 10 10.1336 10 11C10 13.7614 7.76142 16 5 16C2.23858 16 0 13.7614 0 11C0 8.23858 2.23858 6 5 6C5.86643 6 6.68138 6.22038 7.39186 6.60814L13.4697 0.53033C13.7626 0.237436 14.2374 0.237437 14.5303 0.53033ZM5 13C6.10457 13 7 12.1046 7 11C7 9.89543 6.10457 9 5 9C3.89543 9 3 9.89543 3 11C3 12.1046 3.89543 13 5 13Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Key16Icon
