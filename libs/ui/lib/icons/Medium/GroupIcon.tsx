import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function GroupIcon({
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
        d="M6 4a2 2 0 11-4 0 2 2 0 014 0zM1 14V7h6v7H1zm14 0V7H9v7h6zM14 4a2 2 0 11-4 0 2 2 0 014 0z"
        fill="#48D597"
      />
    </svg>
  )
}

export default GroupIcon
