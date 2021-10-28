import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function FilterIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={12}
      height={12}
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
        d="M0 1h12v2H0V1zm2 4h8v2H2V5zm6 4H4v2h4V9z"
        fill="#48D597"
      />
    </svg>
  )
}

export default FilterIcon
