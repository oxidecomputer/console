import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Settings24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/settings">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 7.09127C2 6.72658 2.19853 6.39081 2.51808 6.21506L11.5181 1.26506C11.8182 1.10001 12.1818 1.10001 12.4819 1.26506L21.4819 6.21506C21.8015 6.39081 22 6.72658 22 7.09127V16.9087C22 17.2734 21.8015 17.6092 21.4819 17.7849L12.4819 22.7349C12.1818 22.9 11.8182 22.9 11.5181 22.7349L2.51808 17.7849C2.19853 17.6092 2 17.2734 2 16.9087V7.09127ZM12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Settings24Icon
