import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SearchMediumIcon({
  title = 'Search',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 7a4 4 0 11-8 0 4 4 0 018 0zm-.524 4.89a6 6 0 111.414-1.414l2.817 2.817-1.414 1.414-2.816-2.816z"
        fill="#48D597"
      />
    </svg>
  )
}

export default SearchMediumIcon
