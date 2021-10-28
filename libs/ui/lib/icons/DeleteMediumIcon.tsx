import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function DeleteMediumIcon({
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
        d="M6 0h4l1 1h3v2H2V1h3l1-1zm7 5H3v11h10V5zm-8 9V7h2v7H5zm6 0V7H9v7h2z"
        fill="#48D597"
      />
    </svg>
  )
}

export default DeleteMediumIcon
