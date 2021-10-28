import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function ShowMediumIcon({
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
        d="M0 8s2.5-4 8-4 8 4 8 4-2.5 4-8 4-8-4-8-4zm8 3a3 3 0 100-6 3 3 0 000 6z"
        fill="#48D597"
      />
    </svg>
  )
}

export default ShowMediumIcon
