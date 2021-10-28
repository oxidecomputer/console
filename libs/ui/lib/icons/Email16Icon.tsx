import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Email16Icon({
  title = '',
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
        d="M8 7L1.6 3h12.8L8 7zm-8 6V4l8 5 8-5v9H0z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Email16Icon
