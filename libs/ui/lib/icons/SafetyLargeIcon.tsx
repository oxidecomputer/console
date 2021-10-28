import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SafetyLargeIcon({
  title = 'Safety',
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
        d="M12 23l-4.2-2.5c-3-1.8-4.8-5.1-4.8-8.6V3l9-2 9 2v8.9c0 3.5-1.8 6.7-4.8 8.6L12 23z"
        fill="#48D597"
      />
    </svg>
  )
}

export default SafetyLargeIcon
