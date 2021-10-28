import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function KeySmallIcon({
  title = 'Key',
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
        d="M10.5 0L12 1.5l-.75.75L12 3l-1 1-.75-.75-1 1L10 5 9 6l-.75-.75-1.206 1.206a3.75 3.75 0 11-1.5-1.5L10.5 0zM3.75 10a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5z"
        fill="#48D597"
      />
    </svg>
  )
}

export default KeySmallIcon
