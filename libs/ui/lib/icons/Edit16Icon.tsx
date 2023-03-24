import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Edit16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/edit">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.75 16C0.335786 16 0 15.6642 0 15.25V12.3107C0 12.1117 0.0790174 11.921 0.21967 11.7803L8.46967 3.53033C8.76256 3.23744 9.23744 3.23744 9.53033 3.53033L12.4697 6.46967C12.7626 6.76256 12.7626 7.23744 12.4697 7.53033L4.21967 15.7803C4.07902 15.921 3.88825 16 3.68934 16H0.75ZM13.4697 5.46967C13.7626 5.76256 14.2374 5.76256 14.5303 5.46967L15.4697 4.53033C15.7626 4.23744 15.7626 3.76256 15.4697 3.46967L12.5303 0.530329C12.2374 0.237436 11.7626 0.237437 11.4697 0.53033L10.5303 1.46967C10.2374 1.76256 10.2374 2.23744 10.5303 2.53033L13.4697 5.46967Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Edit16Icon
