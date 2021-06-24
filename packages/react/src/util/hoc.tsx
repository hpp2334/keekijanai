export function withComponentsFactory(...Components: React.JSXElementConstructor<{ children?: React.ReactNode }>[]) {
  function withComponents <Props>(BaseComponent: React.JSXElementConstructor<Props>) {
    const Inner = (props: Props) => {
      const base = (
        <BaseComponent {...props} />
      )
      return Components.reduceRight((element, Component) => (
        <Component>
          {element}
        </Component>
      ), base);
    }
    return Inner;
  }
  return withComponents;
}
