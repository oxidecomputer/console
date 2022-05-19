import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Close8Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={8}
    height={8}
    viewBox="0 0 8 8"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="8/close">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4.70714L6.47485 7.18198L7.18195 6.47488L4.70711 4.00003L7.182 1.52514L6.47489 0.818033L4 3.29293L1.5251 0.818024L0.817993 1.52513L3.29289 4.00003L0.818039 6.47489L1.52515 7.18199L4 4.70714Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Close8Icon
