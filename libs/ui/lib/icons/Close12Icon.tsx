import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Close12Icon({
  title = '',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={17}
      height={17}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.208 8.5l3.896-3.896-.708-.708L8.5 7.792 4.604 3.896l-.708.708L7.792 8.5l-3.896 3.896.708.708L8.5 9.208l3.896 3.896.708-.708L9.208 8.5z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Close12Icon
