import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Person24Icon({
  title = 'Person',
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
        d="M16 5a4 4 0 11-8 0 4 4 0 018 0zM7 23V11h10v12H7z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Person24Icon
