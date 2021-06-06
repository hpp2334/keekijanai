import './CodeSources.css'

import { Tabs } from 'antd'
import React, { useImperativeHandle, useMemo, useState } from 'react'
import { useCodeSources } from './controller';
import { useCopyToClipboard } from 'react-use';
import clsx from 'clsx';

import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TranslationContext } from '../../translations';

export interface HightlightProps {
  src: string;
  source: string;
}

export type CodeSourcesProps = {
  /** 获取文件自身内容（即源码），如使用 webpack，可以使用 require.context API 与 raw-loader */
  get: (key: string) => string | { default: string };
  /** 从 key 映射到 name，渲染时标签页名称会使用 name */
  nameMap?: Record<string, string>;
  /** 需要显示源代码的文件的 key 组成的数组 */
  sourceList: string[];
  refSource?: React.Ref<any>;
}

const Highlight = React.memo(function Highlight(props: HightlightProps) {
  const { src, source } = props;
  const lang = src.match(/\.\w+$/)?.[0]?.slice(1) ?? 'txt';

  return (
    <div className="kkjn__code-container">
      <SyntaxHighlighter language={lang} style={a11yDark}>
        {source}
      </SyntaxHighlighter>
    </div>
  )
}, (prev, next) => prev.src === next.src);


export function CodeSources(props: CodeSourcesProps) {
  const codeSourcesHookObject = useCodeSources(props);
  const { refSource } = props;
  const { sources, isEmpty } = codeSourcesHookObject;
  const [activeKey, setActiveKey] = useState(isEmpty ? '' : sources[0].key);

  const [state, copy] = useCopyToClipboard();
  useImperativeHandle(refSource, () => ({
    copy: () => {
      const code = sources.find(item => item.key === activeKey)?.source;
      if (typeof code === 'string') {
        copy(code);
      }
    }
  }), [activeKey, copy]);

  return isEmpty ? null : (
    <TranslationContext>
      <div className={clsx('kkjn__code-sources')}>
        <Tabs className={clsx('kkjn__tabs')} activeKey={activeKey} onChange={setActiveKey} tabPosition='top'>
          {
            sources.map(item => (
              <Tabs.TabPane tab={item.name} key={item.key}>
                <Highlight src={item.key} source={item.source} />
              </Tabs.TabPane>
            ))
          }
        </Tabs>
      </div>
    </TranslationContext>
  )
}

export function withCodeSources(get: CodeSourcesProps['get']) {
  return function WrapperCodeSources(props: Omit<CodeSourcesProps, 'get'>) {
    return (
      <CodeSources get={get} {...props} />
    );
  }
}
