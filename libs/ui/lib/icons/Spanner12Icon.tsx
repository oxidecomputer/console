import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Spanner12Icon({
  title = 'Spanner',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={12}
      height={12}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.646 7.646A4 4 0 01.353 2.353L3 5l2-2L2.353.354a4 4 0 015.293 5.293L12 10l-2 2-4.354-4.354z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Spanner12Icon
