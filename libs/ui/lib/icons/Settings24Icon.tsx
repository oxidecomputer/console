import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Settings24Icon({
  title = 'Settings',
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
        d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 15c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Settings24Icon
