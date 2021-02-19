type SvgrComponent = React.FC<React.SVGProps<SVGSVGElement>>

declare module '*.svg' {
  const ReactComponent: SvgrComponent
  const content: string

  export { ReactComponent }
  export default content
}
