import React, { useState } from 'react';
import { useCodeEffect } from './controller';
import { getCodeEffectContainer } from './code-effect-components';
import { Card } from 'antd';
import { TranslationContext } from '../../translations';

export type CodeEffectProps = {
  /**
   * type 默认为 "react"，根据 type 决定入口文件导出：
   * - type === "native"：需要入口文件导出 { html, handler }，其中 handler 会被异步调度（通过 useEffect）  
   * - type === "native"：需要入口文件默认导出 ReactNode  
   */
  type?: 'native' | 'react' | undefined;
  /** 获取文件导出，如使用 webpack，可以使用 require.context API */
  get: (key: string) => any;
  /** 入口文件 key */
  entry: string;
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
    <TranslationContext>
      <Card>
        {!isContainerValid && (
          <div>

          </div>
        )}
        {isContainerValid && Container && (
          <Container {...demoExports} />
        )}
      </Card>
    </TranslationContext>
  )
}

export function withCodeEffect(get: CodeEffectProps['get']) {
  return function WrapperCodeEffect(props: Omit<CodeEffectProps, 'get'>) {
    return (
      <CodeEffect get={get} {...props} />
    );
  }
}
