import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Resize16Icon({
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
        d="M11 0v2h3v3h2V0h-5zM0 11h2v3h3v2H0v-5zm4-7h8v8H4V4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Resize16Icon
