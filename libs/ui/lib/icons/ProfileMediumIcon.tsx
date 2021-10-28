import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function ProfileMediumIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
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
        d="M11 14.326a7 7 0 10-6.002-12.65A7 7 0 0011 14.326zM11 9v3c-.836.628-1.874 1-3 1a4.978 4.978 0 01-3-1V9h6zm-1-3a2 2 0 11-4 0 2 2 0 014 0z"
        fill="#48D597"
      />
    </svg>
  )
}

export default ProfileMediumIcon
