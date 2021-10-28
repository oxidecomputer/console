import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Storage16Icon({
  title = 'Storage',
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
        d="M10 1h2l3 4v10H1V1h2v4h7V1zM8 12a2 2 0 100-4 2 2 0 000 4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Storage16Icon
