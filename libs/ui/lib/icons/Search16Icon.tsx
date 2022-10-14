import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Search16Icon = ({
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
    <g id="16/search">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 7C11 9.20914 9.20914 11 7 11C4.79086 11 3 9.20914 3 7C3 4.79086 4.79086 3 7 3C9.20914 3 11 4.79086 11 7ZM10.4765 11.8907C9.49572 12.5892 8.29583 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7C13 8.29583 12.5892 9.49572 11.8907 10.4765L14.7071 13.2929L13.2929 14.7071L10.4765 11.8907Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Search16Icon
