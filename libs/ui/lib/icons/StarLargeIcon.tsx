import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function StarLargeIcon({
  title = 'Star',
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
        d="M12 1l2.7 4.5 5.1-1.3-1.3 5.1L23 12l-4.5 2.7 1.3 5.1-5.1-1.3L12 23l-2.7-4.5-5.1 1.3 1.3-5.1L1 12l4.5-2.7-1.3-5.1 5.1 1.3L12 1z"
        fill="currentColor"
      />
    </svg>
  )
}

export default StarLargeIcon
