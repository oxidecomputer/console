import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function KeyMediumIcon({
  title = 'Key',
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
        d="M14 0l2 2-1 1 1 1-1 1-1-1-1 1 1 1-2 2-1-1-1.608 1.608a5 5 0 11-2-2L14 0zM5 13a2 2 0 100-4 2 2 0 000 4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default KeyMediumIcon
