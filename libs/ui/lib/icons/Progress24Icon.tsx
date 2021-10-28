import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Progress24Icon({
  title = 'Progress',
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
        d="M12 1L6 7h12l-6-6zM6 15l6-6 6 6H6zm0 8l6-6 6 6H6z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Progress24Icon
