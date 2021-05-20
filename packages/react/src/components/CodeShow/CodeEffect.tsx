import React, { useState } from 'react';
import { useCodeEffect } from './controller';
import { getCodeEffectContainer } from './code-effect-components';
import { Card } from 'antd';

export type CodeEffectProps = {
  get: (key: string) => any;
  entry: string;
  type?: 'native' | 'react' | undefined;
}

export function CodeEffect(props: CodeEffectProps) {
  const demoShowHookObject = useCodeEffect(props);

  const [demoExports] = useState(() => {
    const { entry, get } = demoShowHookObject;
    const exports = get(entry);
    return exports;
  });
  const [Container] = useState(() => {
    return getCodeEffectContainer(demoShowHookObject.type);
  });

  const isContainerValid = !!Container && (typeof demoExports === 'object' && demoExports !== null);

  return (
    <Card>
      {!isContainerValid && (
        <div>

        </div>
      )}
      {isContainerValid && Container && (
        <Container {...demoExports} />
      )}
    </Card>
  )
}

export function withCodeEffect(get: CodeEffectProps['get']) {
  return function WrapperCodeEffect(props: Omit<CodeEffectProps, 'get'>) {
    return (
      <CodeEffect get={get} {...props} />
    );
  }
}
