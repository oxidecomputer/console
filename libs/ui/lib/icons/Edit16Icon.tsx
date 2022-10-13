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
        d="M0 16V12L9 3L13 7L4 16H0ZM14 6L16 4L12 0L10 2L14 6Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Edit16Icon
