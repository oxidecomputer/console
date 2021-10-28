import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function WindowsDistroIcon({
  title = 'Windows',
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
        d="M0 2.265l6.539-.887.003 6.287-6.536.037L0 2.265zM6.536 8.39l.005 6.293-6.536-.896v-5.44l6.53.043zm.792-7.129L15.998 0v7.585l-8.67.069V1.26zM16 8.45L15.998 16l-8.67-1.22-.012-6.345L16 8.449z"
        fill="#fff"
      />
    </svg>
  )
}

export default WindowsDistroIcon
