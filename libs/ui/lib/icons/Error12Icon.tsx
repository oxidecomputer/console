import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Error12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/error">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM6.083 3C6.45137 3 6.75 3.29863 6.75 3.667V6.333C6.75 6.70137 6.45137 7 6.083 7H5.917C5.54863 7 5.25 6.70137 5.25 6.333V3.667C5.25 3.29863 5.54863 3 5.917 3H6.083ZM6.083 8C6.45137 8 6.75 8.29863 6.75 8.667V8.833C6.75 9.20137 6.45137 9.5 6.083 9.5H5.917C5.54863 9.5 5.25 9.20137 5.25 8.833V8.667C5.25 8.29863 5.54863 8 5.917 8H6.083Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Error12Icon
