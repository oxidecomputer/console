import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function Unauthorized2SmallIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={12}
      height={12}
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
        d="M10.5 6a4.5 4.5 0 01-7.107 3.668l6.275-6.275A4.48 4.48 0 0110.5 6zM2.332 8.607l6.275-6.275a4.5 4.5 0 00-6.275 6.275zM12 6A6 6 0 110 6a6 6 0 0112 0z"
        fill="#E86886"
      />
    </svg>
  )
}

export default Unauthorized2SmallIcon
