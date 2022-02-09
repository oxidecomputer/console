import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Error12Icon({
  title = 'Error',
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
        d="M6 12A6 6 0 106 0a6 6 0 000 12zm-.75-5V3h1.5v4h-1.5zm0 2.5V8h1.5v1.5h-1.5z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Error12Icon
