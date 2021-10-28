import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function TimeLargeIcon({
  title = 'Time',
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
        d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm3.3 15.7L11 12.4V4h2v7.6l3.7 3.7-1.4 1.4z"
        fill="#48D597"
      />
    </svg>
  )
}

export default TimeLargeIcon
