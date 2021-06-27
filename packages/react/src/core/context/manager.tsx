import React from "react";
import { withComponents } from "../../util/hoc";

type Props = { children?: React.ReactNode };
type ContextConstructor = React.JSXElementConstructor<Props>;
const set: Set<ContextConstructor> = new Set();

export const pushContext = (context: ContextConstructor) => {
  set.add(context);
}

export const RegisteredContext = (props: { children?: React.ReactNode }) => {
  const {
    children,
  } = props;
  const element = [...set].reduceRight((element, Component) => (
    <Component>
      {element}
    </Component>
  ), <>{children}</>);

  return element;
}
