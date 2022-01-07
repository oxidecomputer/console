import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Refresh16Icon({
  title = 'Refresh',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.806 4.182A4 4 0 0111.873 7H10l3 3 3-3h-2.084A6 6 0 003.757 3.757l1.415 1.415a4 4 0 011.634-.99zM3 6L0 9h2.084a6 6 0 0010.159 3.243l-1.415-1.415A3.999 3.999 0 014.127 9H6L3 6z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Refresh16Icon
