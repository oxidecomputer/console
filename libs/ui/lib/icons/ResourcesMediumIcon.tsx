import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function ResourcesMediumIcon({
  title = 'Resources',
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
        d="M0 2h16v5H0V2zm4 2.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM0 9h16v5H0V9zm4 2.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
        fill="currentColor"
      />
    </svg>
  )
}

export default ResourcesMediumIcon
