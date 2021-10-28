import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function HideMediumIcon({
  title = 'Hide',
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
        d="M13 1l1 1-2.573 2.573-1.306 1.306L5.88 10.12l-1.306 1.306L2 14l-1-1 2.19-2.19C1.02 9.633 0 8 0 8s2.5-4 8-4c.657 0 1.27.057 1.843.157L13 1zM8.871 5.129a3 3 0 00-3.743 3.743l3.743-3.743zm3.94.06l-1.94 1.94a3 3 0 01-3.743 3.743l-.97.97C6.728 11.944 7.342 12 8 12c5.5 0 8-4 8-4s-1.02-1.632-3.19-2.81z"
        fill="#48D597"
      />
    </svg>
  )
}

export default HideMediumIcon
