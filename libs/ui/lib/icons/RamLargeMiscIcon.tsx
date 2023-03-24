import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const RamLargeMiscIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={19}
    height={19}
    viewBox="0 0 19 19"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="misc/ram-large">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 5.06667H0V6.99999C0.552285 6.99999 1 7.44771 1 7.99999C1 8.55228 0.552283 8.99999 0 8.99999V11H19V8.99999C18.4477 8.99999 18 8.55228 18 7.99999C18 7.44771 18.4477 6.99999 19 6.99999L19 5.06667ZM5 6H2V10H5V6ZM6 6H9V10H6V6ZM13 6H10V10H13V6ZM14 6H17V10H14V6ZM0.999999 14H2L2 12H1L0.999999 14ZM4 14H3L3 12H4L4 14ZM5 14H6L6 12H5L5 14ZM8 14H7L7 12H8L8 14ZM9 14H10L10 12H9L9 14ZM12 14H11L11 12H12L12 14ZM13 14H14L14 12H13L13 14ZM16 14H15L15 12H16L16 14ZM18 14H17L17 12H18L18 14Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default RamLargeMiscIcon
