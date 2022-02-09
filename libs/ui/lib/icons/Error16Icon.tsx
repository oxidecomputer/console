import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Error16Icon({
  title = 'Error',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15A7 7 0 108 1a7 7 0 000 14zM5.53 4.47L8 6.94l2.47-2.47 1.06 1.06L9.06 8l2.47 2.47-1.06 1.06L8 9.06l-2.47 2.47-1.06-1.06L6.94 8 4.47 5.53l1.06-1.06z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Error16Icon
