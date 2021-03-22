type SvgrComponent = React.FC<React.SVGProps<SVGSVGElement>>

declare module '*.svg' {
  const ReactComponent: SvgrComponent

  export default ReactComponent
}
