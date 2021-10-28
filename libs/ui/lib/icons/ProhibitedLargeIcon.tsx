import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function ProhibitedLargeIcon({
  title = 'Prohibited',
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
        d="M16.49 5.388A7.942 7.942 0 0012 4c-4.4 0-8 3.6-8 8 0 1.661.513 3.208 1.388 4.49L16.49 5.388zm2.122 2.122L7.51 18.612A7.942 7.942 0 0012 20c4.4 0 8-3.6 8-8a7.942 7.942 0 00-1.388-4.49zM1 12C1 5.9 5.9 1 12 1s11 4.9 11 11-4.9 11-11 11S1 18.1 1 12z"
        fill="currentColor"
      />
    </svg>
  )
}

export default ProhibitedLargeIcon
