import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Cloud16Icon({
  title = 'Cloud',
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
        d="M13.333 7v.018A3 3 0 0113 13H4a4 4 0 01-.254-7.992A5.001 5.001 0 0113.333 7z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Cloud16Icon
