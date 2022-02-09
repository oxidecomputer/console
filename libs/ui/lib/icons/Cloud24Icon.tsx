import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Cloud24Icon({
  title = 'Cloud',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 18.978A5.5 5.5 0 115.427 8a7.5 7.5 0 0114.559 2.025A4.5 4.5 0 1119 18.973V19H6v-.022z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Cloud24Icon
