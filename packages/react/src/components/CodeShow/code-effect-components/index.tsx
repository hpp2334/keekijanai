import { useEffect } from "react";
import { ReactDemo } from './react';
import { NativeDemo } from './native';

interface DemoItem {
  type: 'react' | 'native';
  Component: (props: any) => JSX.Element;
}

const strategies: Array<DemoItem> = [
  {
    type: 'native',
    Component: NativeDemo,
  },
  {
    type: 'react',
    Component: ReactDemo,
  }
];

export function getCodeEffectContainer(type: string) {
  return strategies.find(item => item.type === type)?.Component;
}
