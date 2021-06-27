import _ from 'lodash';

type ComponentWithChildren = React.JSXElementConstructor<{ children?: React.ReactNode }>; 

export function withComponents <Props>(Components: ComponentWithChildren[], BaseComponent: React.JSXElementConstructor<Props>): React.JSXElementConstructor<Props>;
export function withComponents <Props>(Components: ComponentWithChildren[], element: JSX.Element): React.JSXElementConstructor<Props>;

export function withComponents <Props>(Components: ComponentWithChildren[], Element: React.JSXElementConstructor<Props> | JSX.Element) {
  const Inner = (props: Props) => {
    const base = typeof Element === 'function'
      ? (
        <Element {...props} />
      )
      : Element;
    return Components.reduceRight((element, Component) => (
      <Component>
        {element}
      </Component>
    ), base);
  }
  return Inner;
}

export function withComponentsFactory(...Components: React.JSXElementConstructor<{ children?: React.ReactNode }>[]) {
  return _.partial(withComponents, Components);
}
