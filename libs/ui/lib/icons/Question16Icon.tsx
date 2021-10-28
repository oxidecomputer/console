import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Question16Icon({
  title = '',
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
      <path d="M8 8a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" />
      <circle cx={8} cy={8} r={7} fill="currentColor" />
      <path
        d="M7.25 9.837h1.219v-.081c.017-.98.298-1.42 1.022-1.867.763-.46 1.232-1.108 1.232-2.067 0-1.385-1.048-2.322-2.612-2.322-1.436 0-2.587.84-2.642 2.374h1.295c.051-.904.695-1.3 1.347-1.3.724 0 1.312.481 1.312 1.236 0 .635-.396 1.082-.903 1.397-.793.486-1.261.968-1.27 2.549v.08zm.643 2.59c.465 0 .853-.379.853-.852a.857.857 0 00-.853-.848.854.854 0 00-.852.848c0 .473.384.853.852.853z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Question16Icon
