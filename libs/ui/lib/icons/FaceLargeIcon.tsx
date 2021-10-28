import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function FaceLargeIcon({
  title = 'Face',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 8C4.3 8 3 6.7 3 5s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm12 0c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm-6 15c6.1 0 11-4.9 11-11H1c0 6.1 4.9 11 11 11z"
        fill="#48D597"
      />
    </svg>
  )
}

export default FaceLargeIcon
