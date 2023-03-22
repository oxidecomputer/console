import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Settings16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/settings">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.3721 0.212631C8.14153 0.0808741 7.85847 0.0808741 7.6279 0.212631L1.3779 3.78406C1.14421 3.91759 1 4.1661 1 4.43524V11.5648C1 11.8339 1.14421 12.0824 1.3779 12.2159L7.6279 15.7874C7.85847 15.9191 8.14153 15.9191 8.3721 15.7874L14.6221 12.2159C14.8558 12.0824 15 11.8339 15 11.5648V4.43524C15 4.1661 14.8558 3.91759 14.6221 3.78406L8.3721 0.212631ZM8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Settings16Icon
