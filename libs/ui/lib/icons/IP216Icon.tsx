import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function IP216Icon({
  title = 'IP',
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
      <g fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 7a3 3 0 10-1.752-.564l-1.53 2.65a3 3 0 101.32.713l1.627-2.817c.11.012.222.018.335.018zm7 5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path d="M12.527 10.475l-1.299.75L8.5 6.5l1.299-.75 2.728 4.725z" />
      </g>
    </svg>
  )
}

export default IP216Icon
