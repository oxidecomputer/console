import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function CommentAlertIcon({
  title = 'Comment',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={20}
      height={20}
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
        d="M9.03 4H6.97L4.03 15.758 3.97 16h2.06L8.97 4.243 9.03 4zm4 12h-2.06l.06-.242L13.97 4h2.06l-.06.243L13.03 16z"
        fill="#48D597"
      />
    </svg>
  )
}

export default CommentAlertIcon
